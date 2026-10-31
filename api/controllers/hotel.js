import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const str = (v) => (typeof v === "string" ? v.trim() : "");

export const createHotel = async (req, res, next) => {
  try {
    const savedHotel = await new Hotel(req.body).save();
    res.status(201).json(savedHotel);
  } catch (err) {
    next(err);
  }
};
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedHotel) return next(createError(404, "Hotel not found."));
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (hotel?.rooms?.length) await Room.deleteMany({ _id: { $in: hotel.rooms } });
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return next(createError(404, "Hotel not found."));
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

// GET /api/hotels?city=&type=&featured=&min=&max=&limit=
// Only whitelisted, string-typed query params are used, so query objects like
// ?city[$ne]=x can't be injected into the Mongo filter.
export const getHotels = async (req, res, next) => {
  const city = str(req.query.city);
  const type = str(req.query.type);
  const featured = str(req.query.featured);
  const min = Number(req.query.min) || 0;
  const max = Number(req.query.max) || 1_000_000;
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  const filter = { cheapestPrice: { $gte: min, $lte: max } };
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}`, "i"); // prefix match: "mad" -> Madrid
  if (type) filter.type = type.toLowerCase();
  if (featured) filter.featured = featured === "true";

  try {
    const hotels = await Hotel.find(filter).limit(limit);
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};
export const countByCity = async (req, res, next) => {
  const cities = str(req.query.cities).split(",").map((c) => c.trim()).filter(Boolean);
  try {
    const list = await Promise.all(
      cities.map((city) =>
        Hotel.countDocuments({ city: new RegExp(`^${escapeRegex(city)}$`, "i") })
      )
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

const TYPES = [
  ["hotel", "hotels"],
  ["apartment", "apartments"],
  ["resort", "resorts"],
  ["villa", "villas"],
  ["cabin", "cabins"],
];

export const countByType = async (req, res, next) => {
  try {
    const counts = await Promise.all(
      TYPES.map(([type]) => Hotel.countDocuments({ type }))
    );
    res.status(200).json(
      TYPES.map(([type, label], i) => ({ type, label, count: counts[i] }))
    );
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return next(createError(404, "Hotel not found."));
    const rooms = await Room.find({ _id: { $in: hotel.rooms } });
    res.status(200).json(rooms);
  } catch (err) {
    next(err);
  }
};
