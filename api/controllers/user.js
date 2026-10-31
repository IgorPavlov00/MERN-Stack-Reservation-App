import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createError } from "../utils/error.js";

export const updateUser = async (req, res, next) => {
  try {
    const update = { ...req.body };
    // Users must not be able to promote themselves; only admins may set isAdmin.
    if (!req.user.isAdmin) delete update.isAdmin;
    if (update.password) update.password = await bcrypt.hash(update.password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).select("-password");
    if (!updatedUser) return next(createError(404, "User not found."));
    res.status(200).json(updatedUser);
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
