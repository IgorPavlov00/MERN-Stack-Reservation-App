const DAY = 24 * 60 * 60 * 1000;

// Ratings are stored 0-5; show them on a 10-point scale.
export const score = (rating) => (rating != null ? (rating * 2).toFixed(1) : null);

export const ratingLabel = (rating) => {
  const s = rating * 2;
  if (s >= 9) return "Exceptional";
  if (s >= 8) return "Excellent";
  if (s >= 7) return "Very good";
  return "Good";
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
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
