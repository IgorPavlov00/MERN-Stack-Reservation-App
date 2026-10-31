import mongoose from "mongoose";

const BookedRoomSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomNumberId: { type: mongoose.Schema.Types.ObjectId, required: true },
    number: Number,
    title: String,
    price: Number, // price per night at booking time
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    // Denormalised so a booking still reads correctly if the hotel changes later.
    hotelName: String,
    hotelCity: String,
    hotelPhoto: String,
    rooms: { type: [BookedRoomSchema], validate: (v) => v.length > 0 },
    checkIn: { type: Date, required: true }, // UTC midnight of the first night
    checkOut: { type: Date, required: true }, // UTC midnight of departure day
    nights: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
