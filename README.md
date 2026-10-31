# 🏨 Staybook — MERN Hotel Reservation App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack hotel booking app built with MongoDB, Express, React and Node.js. Search stays by destination, dates and guests, browse property details and reserve rooms.

## ✨ Features

- **Search & filters** – destination (prefix match), property type, price range, dates and guests
- **Hotel pages** – photo gallery with lightbox, amenities, live price estimate for the selected stay
- **Reservations** – pick specific room numbers; already-booked nights are blocked (server rejects double bookings)
- **Auth** – register / sign in / sign out with JWT in an `httpOnly` cookie
- **Admin API** – create/update/delete hotels and rooms (admin-only routes)
- **Responsive UI** – works on desktop and mobile

## 💻 Tech stack

| Layer    | Tech                                                       |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19, React Router 7, Vite, react-date-range, Font Awesome |
| Backend  | Node.js, Express 4, Mongoose, JWT, bcrypt                  |
| Database | MongoDB (Atlas)                                            |

In production a single Express server serves both the API (`/api/*`) and the built React app.

## 🚀 Running locally

**Prerequisites:** Node.js 20+ and a MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
git clone https://github.com/IgorPavlov00/MERN-Stack-Reservation-App.git
cd MERN-Stack-Reservation-App

cp .env.example .env        # then fill in MONGO and JWT
npm install
npm install --prefix client

npm run seed                # optional: adds sample hotels & rooms
npm run dev                 # API on http://localhost:8800
npm run dev --prefix client # React app on http://localhost:3000 (proxies /api to :8800)
```

### Environment variables

| Name    | Description                                     |
| ------- | ----------------------------------------------- |
| `MONGO` | MongoDB connection string                       |
| `JWT`   | Long random secret used to sign login tokens    |
| `PORT`  | Port for the server (default `8800`)            |

### Scripts

| Command                     | What it does                                         |
| --------------------------- | ---------------------------------------------------- |
| `npm start`                 | Start the production server                          |
| `npm run dev`               | Start the API with nodemon                           |
| `npm run build`             | Install client deps and build the React app          |
| `npm run seed`              | Seed sample data (skips if hotels already exist)     |
| `npm run seed -- --reset`   | **Deletes all hotels & rooms**, then seeds           |

To make a user an admin, set `isAdmin: true` on their document in MongoDB.

## ☁️ Deploying to Render

The repo includes a [`render.yaml`](render.yaml) Blueprint.

1. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` (Render uses dynamic IPs).
2. On [Render](https://dashboard.render.com): **New → Blueprint**, pick this repository.
3. When prompted, set `MONGO` to your Atlas connection string (`JWT` is generated automatically).
4. After the first deploy, seed the database once from your machine: `npm run seed` (with `MONGO` pointing at the same database).

Render runs `npm install && npm run build`, then `npm start`. Health check: `/api/health`.

> Note: Render's free plan sleeps after inactivity, so the first request can take ~30–60 seconds.

## 📡 API overview

| Method | Route                              | Auth   |
| ------ | ---------------------------------- | ------ |
| POST   | `/api/auth/register`, `/login`, `/logout` | –      |
| GET    | `/api/hotels?city=&type=&min=&max=&featured=&limit=` | –      |
| GET    | `/api/hotels/find/:id`, `/api/hotels/room/:id` | –      |
| GET    | `/api/hotels/countByCity?cities=a,b`, `/countByType` | –      |
| PUT    | `/api/rooms/availability/:roomNumberId` `{ dates: [] }` | user   |
| POST/PUT/DELETE | `/api/hotels…`, `/api/rooms…`  | admin  |
| GET/PUT/DELETE  | `/api/users/:id`               | owner or admin |
