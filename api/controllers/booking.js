import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";
import { parseStay, nightsOf, todayUTC } from "../utils/dates.js";
import { sendBookingConfirmed, sendBookingUpdated, sendBookingCancelled } from "../utils/emails.js";

// Atomically add `nights` to one room number, only if none of them are taken.
const claimNights = async (roomNumberId, nights) => {
  const res = await Room.updateOne(
    { roomNumbers: { $elemMatch: { _id: roomNumberId, unavailableDates: { $nin: nights } } } },
    { $push: { "roomNumbers.$.unavailableDates": { $each: nights } } }
  );
  return res.modifiedCount === 1;
};

const releaseNights = (roomNumberId, nights) =>
  Room.updateOne(
    { "roomNumbers._id": roomNumberId },
    { $pull: { "roomNumbers.$.unavailableDates": { $in: nights } } }
  );

// Claim nights for every room number, or none: roll back on the first failure.
const claimAll = async (roomNumberIds, nights) => {
  const done = [];
  for (const id of roomNumberIds) {
    if (await claimNights(id, nights)) done.push(id);
    else {
      await Promise.all(done.map((d) => releaseNights(d, nights)));
      return id; // the room number that was unavailable
    }
  }
  return null;
};

const notify = (fn, userId, booking) =>
  // Email failures must never break the booking itself.
  User.findById(userId)
    .then((u) => u && fn(u, booking))
    .catch((e) => console.error("[mail]", e.message));

const loadOwnBooking = async (req) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw createError(404, "Reservation not found.");
  if (String(booking.user) !== req.user.id && !req.user.isAdmin)
    throw createError(403, "You are not authorized!");
  return booking;
};

const isUpcoming = (booking) => booking.status === "confirmed" && booking.checkIn >= todayUTC();

// POST /api/bookings  { hotelId, roomNumberIds: [], checkIn: "YYYY-MM-DD", checkOut: "YYYY-MM-DD" }
export const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomNumberIds, checkIn: inStr, checkOut: outStr } = req.body;
    const stay = parseStay(inStr, outStr);
    if (stay.error) return next(createError(400, stay.error));

    const ids = [...new Set(Array.isArray(roomNumberIds) ? roomNumberIds.map(String) : [])];
    if (!ids.length) return next(createError(400, "Select at least one room."));
    if (ids.length > 10) return next(createError(400, "You can book at most 10 rooms at once."));
    if (!mongoose.isValidObjectId(hotelId) || !ids.every((id) => mongoose.isValidObjectId(id)))
      return next(createError(400, "Invalid id."));

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return next(createError(404, "Hotel not found."));

    // Resolve each room number and make sure it belongs to this hotel.
    const rooms = await Room.find({ _id: { $in: hotel.rooms }, "roomNumbers._id": { $in: ids } });
    const booked = [];
    for (const id of ids) {
      const room = rooms.find((r) => r.roomNumbers.some((n) => String(n._id) === id));
      if (!room) return next(createError(400, "One of the selected rooms does not belong to this hotel."));
      const rn = room.roomNumbers.find((n) => String(n._id) === id);
      booked.push({ roomId: room._id, roomNumberId: rn._id, number: rn.number, title: room.title, price: room.price });
    }

    const failedId = await claimAll(ids, stay.nights);
    if (failedId) {
      const r = booked.find((b) => String(b.roomNumberId) === failedId);
      return next(createError(409, `Room ${r?.number ?? ""} is no longer available for those dates.`));
    }

    const booking = await Booking.create({
      user: req.user.id,
      hotel: hotel._id,
      hotelName: hotel.name,
      hotelCity: hotel.city,
      hotelPhoto: hotel.photos?.[0],
      rooms: booked,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      nights: stay.nights.length,
      total: booked.reduce((s, r) => s + r.price, 0) * stay.nights.length,
    });

    notify(sendBookingConfirmed, req.user.id, booking);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/mine
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ checkIn: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id  { checkIn, checkOut } - change the dates, same rooms
export const updateBooking = async (req, res, next) => {
  try {
    const booking = await loadOwnBooking(req);
    if (!isUpcoming(booking)) return next(createError(400, "Only upcoming reservations can be changed."));

    const stay = parseStay(req.body.checkIn, req.body.checkOut);
    if (stay.error) return next(createError(400, stay.error));

    const ids = booking.rooms.map((r) => r.roomNumberId);
    const oldNights = nightsOf(booking.checkIn, booking.checkOut);

    // Free the current nights, try the new ones, and put the old ones back if that fails.
    await Promise.all(ids.map((id) => releaseNights(id, oldNights)));
    const failedId = await claimAll(ids, stay.nights);
    if (failedId) {
      await Promise.all(ids.map((id) => claimNights(id, oldNights)));
      const r = booking.rooms.find((x) => String(x.roomNumberId) === String(failedId));
      return next(createError(409, `Room ${r?.number ?? ""} is not available for the new dates.`));
    }

    booking.checkIn = stay.checkIn;
    booking.checkOut = stay.checkOut;
    booking.nights = stay.nights.length;
    booking.total = booking.rooms.reduce((s, r) => s + r.price, 0) * stay.nights.length;
    await booking.save();

    notify(sendBookingUpdated, booking.user, booking);
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

// POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await loadOwnBooking(req);
    if (!isUpcoming(booking)) return next(createError(400, "Only upcoming reservations can be cancelled."));

    const nights = nightsOf(booking.checkIn, booking.checkOut);
    await Promise.all(booking.rooms.map((r) => releaseNights(r.roomNumberId, nights)));
    booking.status = "cancelled";
    await booking.save();

    notify(sendBookingCancelled, booking.user, booking);
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};
