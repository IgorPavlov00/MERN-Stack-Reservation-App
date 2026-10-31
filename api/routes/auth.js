import express from "express";
import { register, login, logout, me } from "../controllers/auth.js";
import { verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, me);

export default router;
