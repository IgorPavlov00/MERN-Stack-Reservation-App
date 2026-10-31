import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
});

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(createError(400, "Username, email and password are required."));
    }
    if (password.length < 6) {
      return next(createError(400, "Password must be at least 6 characters."));
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return next(createError(409, "Username or email is already taken."));

    const hash = await bcrypt.hash(password, 10);
    // Only accept known fields so nobody can register themselves as admin.
    await new User({ username, email, password: hash }).save();
    res.status(201).json({ message: "User has been created." });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(createError(400, "Username and password are required."));
    }

    const user = await User.findOne({ username });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return next(createError(400, "Wrong username or password!"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      { expiresIn: "7d" }
    );

    const { password: _pw, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, cookieOptions())
      .status(200)
      .json({ details: otherDetails, isAdmin });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie("access_token", opts).status(200).json({ message: "Logged out." });
};
