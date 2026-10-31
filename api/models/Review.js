import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true, trim: true, minlength: 3, maxlength: 1000 },
    verified: { type: Boolean, default: false }, // reviewer has a booking at this hotel
  },
  { timestamps: true }
);

// One review per user per hotel (posting again edits it).
ReviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", ReviewSchema);
