const DAY = 24 * 60 * 60 * 1000;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// "2026-11-03" -> Date at 2026-11-03T00:00:00Z, or null if invalid.
// Dates travel as plain calendar days so the browser's timezone never shifts them.
export const parseDay = (s) => {
  if (typeof s !== "string" || !DAY_RE.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return isNaN(d) ? null : d;
};

export const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

export const todayUTC = () => parseDay(new Date().toISOString().slice(0, 10));

// Each night from check-in up to (not including) check-out.
export const nightsOf = (checkIn, checkOut) => {
  const n = Math.round((checkOut - checkIn) / DAY);
  return Array.from({ length: n }, (_, i) => new Date(checkIn.getTime() + i * DAY));
};

export const MAX_NIGHTS = 30;

// Validates a check-in/check-out pair from a request body.
// Returns { checkIn, checkOut, nights } or { error }.
export const parseStay = (checkInStr, checkOutStr) => {
  const checkIn = parseDay(checkInStr);
  const checkOut = parseDay(checkOutStr);
  if (!checkIn || !checkOut) return { error: "Dates must be in YYYY-MM-DD format." };
  // Allow "today" for guests a timezone behind UTC.
  if (checkIn < new Date(todayUTC().getTime() - DAY)) return { error: "Check-in can't be in the past." };
  if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };
  const nights = nightsOf(checkIn, checkOut);
  if (nights.length > MAX_NIGHTS) return { error: `Stays are limited to ${MAX_NIGHTS} nights.` };
  return { checkIn, checkOut, nights };
};
