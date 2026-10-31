import mongoose from "mongoose";
import Review from "../models/Review.js";
import Hotel from "../models/Hotel.js";
import Booking from "../models/Booking.js";
import { createError } from "../utils/error.js";

// Keep the hotel's score in sync with its reviews (hotel.rating is stored 0-5).
const refreshHotelRating = async (hotelId) => {
  const [agg] = await Review.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(String(hotelId)) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const update = agg
    ? { rating: Math.round((agg.avg / 2) * 100) / 100, reviewCount: agg.count } // 2 dp so x2 shows exact
    : { reviewCount: 0 };
  await Hotel.findByIdAndUpdate(hotelId, { $set: update });
};

// GET /api/hotels/:id/reviews
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotel: req.params.id }).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/hotels/:id/reviews  { rating: 1-10, comment }  (creates or replaces your review)
export const upsertReview = async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    if (!Number.isInteger(rating) || rating < 1 || rating > 10)
      return next(createError(400, "Rating must be a whole number from 1 to 10."));
    if (comment.length < 3 || comment.length > 1000)
      return next(createError(400, "Comment must be between 3 and 1000 characters."));

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return next(createError(404, "Hotel not found."));

    const user = await mongoose.model("User").findById(req.user.id).select("username");
    if (!user) return next(createError(401, "You are not authenticated!"));
    const verified = Boolean(await Booking.exists({ user: req.user.id, hotel: hotel._id, status: "confirmed" }));

    const review = await Review.findOneAndUpdate(
      { hotel: hotel._id, user: req.user.id },
      { $set: { rating, comment, username: user.username, verified } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await refreshHotelRating(hotel._id);
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id  (author or admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(createError(404, "Review not found."));
    if (String(review.user) !== req.user.id && !req.user.isAdmin)
      return next(createError(403, "You are not authorized!"));
    await review.deleteOne();
    await refreshHotelRating(review.hotel);
    res.status(200).json({ message: "Review deleted." });
  } catch (err) {
    next(err);
  }
};
