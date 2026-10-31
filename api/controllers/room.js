import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

export const createRoom = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelid);
    if (!hotel) return next(createError(404, "Hotel not found."));
    const savedRoom = await new Room(req.body).save();
    await Hotel.findByIdAndUpdate(hotel._id, { $push: { rooms: savedRoom._id } });
    res.status(201).json(savedRoom);
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedRoom) return next(createError(404, "Room not found."));
    res.status(200).json(updatedRoom);
  } catch (err) {
    next(err);
  }
};

// PUT /api/rooms/availability/:roomNumberId  { dates: [ISO strings] }
export const updateRoomAvailability = async (req, res, next) => {
  const dates = Array.isArray(req.body.dates)
    ? req.body.dates.map((d) => new Date(d)).filter((d) => !isNaN(d))
    : [];
  if (!dates.length) return next(createError(400, "No valid dates provided."));

  try {
    // Refuse the booking if any requested date is already taken.
    const result = await Room.updateOne(
      {
        roomNumbers: {
          $elemMatch: { _id: req.params.id, unavailableDates: { $nin: dates } },
        },
      },
      { $push: { "roomNumbers.$.unavailableDates": { $each: dates } } }
    );
    if (result.matchedCount === 0) {
      return next(createError(409, "Room not found or already booked for those dates."));
    }
    res.status(200).json("Room status has been updated.");
  } catch (err) {
    next(err);
  }
};
export const deleteRoom = async (req, res, next) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    await Hotel.findByIdAndUpdate(req.params.hotelid, { $pull: { rooms: req.params.id } });
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return next(createError(404, "Room not found."));
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
};
export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
