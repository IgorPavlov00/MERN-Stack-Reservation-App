import jwt from "jsonwebtoken";
import { createError } from "./error.js";

// Each guard takes an optional `check` that runs after the token is verified.
// (The old version passed the check as a 4th argument that verifyToken never
// called, so verifyUser/verifyAdmin let every logged-in user through.)
const authenticate = (check) => (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return next(createError(401, "You are not authenticated!"));

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    if (check && !check(req)) {
      return next(createError(403, "You are not authorized!"));
    }
    next();
  });
};

export const verifyToken = authenticate();
export const verifyUser = authenticate(
  (req) => req.user.id === req.params.id || req.user.isAdmin
);
export const verifyAdmin = authenticate((req) => req.user.isAdmin);
