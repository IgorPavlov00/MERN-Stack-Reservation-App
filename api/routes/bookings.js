import express from "express";
import { createBooking, getMyBookings, updateBooking, cancelBooking } from "../controllers/booking.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/mine", verifyToken, getMyBookings);
router.put("/:id", verifyToken, updateBooking);
router.post("/:id/cancel", verifyToken, cancelBooking);

export default router;
