import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoute from "./api/routes/auth.js";
import usersRoute from "./api/routes/users.js";
import hotelsRoute from "./api/routes/hotels.js";
import roomsRoute from "./api/routes/rooms.js";
import bookingsRoute from "./api/routes/bookings.js";
import reviewsRoute from "./api/routes/reviews.js";

dotenv.config({ quiet: true });

const { MONGO, JWT, PORT = 8800, NODE_ENV } = process.env;
if (!MONGO || !JWT) {
  console.error("Missing required env vars: MONGO and JWT must be set.");
  process.exit(1);
}

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "client", "dist");

app.set("trust proxy", 1); // Render terminates TLS in front of us
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 })
);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api", (req, res) => res.status(404).json({ success: false, status: 404, message: "Not found" }));

// Serve the built React app; any non-API route falls back to index.html (SPA routing).
app.use(express.static(clientDist));
app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")));

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";
  if (err.name === "CastError") [status, message] = [400, "Invalid id."];
  if (err.name === "ValidationError") status = 400;
  if (err.code === 11000) [status, message] = [409, "That record already exists."];
  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    status,
    message,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
  });
});

mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));

try {
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}
