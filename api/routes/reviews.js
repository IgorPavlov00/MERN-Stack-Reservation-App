import express from "express";
import { deleteReview } from "../controllers/review.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();
router.delete("/:id", verifyToken, deleteReview);

export default router;
