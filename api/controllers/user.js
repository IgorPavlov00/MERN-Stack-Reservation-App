import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createError } from "../utils/error.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUT /api/users/:id  { username?, email?, newPassword?, currentPassword? }
// Changing email or password requires the current password (admins excepted).
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(createError(404, "User not found."));

    const { username, email, newPassword, currentPassword } = req.body;
    const update = {};
    if (typeof username === "string" && username.trim() && username.trim() !== user.username) {
      if (username.trim().length < 3) return next(createError(400, "Username must be at least 3 characters."));
      update.username = username.trim();
    }
    if (typeof email === "string" && email.trim() && email.trim() !== user.email) {
      if (!EMAIL_RE.test(email.trim())) return next(createError(400, "Please enter a valid email address."));
      update.email = email.trim();
    }
    if (newPassword) {
      if (String(newPassword).length < 6) return next(createError(400, "New password must be at least 6 characters."));
      update.password = await bcrypt.hash(String(newPassword), 10);
    }
    if (req.user.isAdmin && typeof req.body.isAdmin === "boolean") update.isAdmin = req.body.isAdmin;

    const sensitive = update.email || update.password;
    if (sensitive && !req.user.isAdmin) {
      const ok = currentPassword && (await bcrypt.compare(String(currentPassword), user.password));
      if (!ok) return next(createError(400, "Your current password is incorrect."));
    }

    if (update.username || update.email) {
      const clash = await User.findOne({
        _id: { $ne: user._id },
        $or: [update.username && { username: update.username }, update.email && { email: update.email }].filter(Boolean),
      });
      if (clash) return next(createError(409, "That username or email is already taken."));
    }

    const updated = await User.findByIdAndUpdate(user._id, { $set: update }, { new: true }).select("-password");
    const { isAdmin, ...details } = updated._doc;
    res.status(200).json({ details, isAdmin });
  } catch (err) {
    next(err);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(createError(404, "User not found."));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
