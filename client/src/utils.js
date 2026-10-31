import { format } from "date-fns";

const DAY = 24 * 60 * 60 * 1000;

// Ratings are stored 0-5; show them on a 10-point scale.
export const score = (rating) => (rating != null ? (rating * 2).toFixed(1) : null);

export const ratingLabel = (rating) => {
  const s = rating * 2;
  if (s >= 9) return "Exceptional";
  if (s >= 8) return "Excellent";
  if (s >= 7) return "Very good";
  if (s >= 6) return "Good";
  return "Fair";
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Calendar day as "YYYY-MM-DD" in the viewer's timezone (what the API expects).
export const dayStr = (d) => format(d, "yyyy-MM-dd");

// Calendar day of a date stored by the API (UTC midnight) -> "YYYY-MM-DD".
export const apiDay = (iso) => new Date(iso).toISOString().slice(0, 10);

// Show an API date (UTC midnight) without the viewer's timezone shifting it.
export const fromApiDay = (iso) => {
  const [y, m, d] = apiDay(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Number of nights between two dates (a same-day range counts as one night).
export const nightsBetween = (start, end) =>
  Math.max(1, Math.round((startOfDay(end) - startOfDay(start)) / DAY));

// The nights being booked: each day from check-in up to (not including) check-out.
export const nightsInRange = (start, end) => {
  const first = startOfDay(start);
  return Array.from({ length: nightsBetween(start, end) }, (_, i) => {
    const d = new Date(first);
    d.setDate(d.getDate() + i);
    return d;
  });
};

// Check-out date for a range, treating a same-day selection as one night.
export const checkoutFor = (start, end) => {
  const nights = nightsInRange(start, end);
  const d = new Date(nights[nights.length - 1]);
  d.setDate(d.getDate() + 1);
  return d;
};
