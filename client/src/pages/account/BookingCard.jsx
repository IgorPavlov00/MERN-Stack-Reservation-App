import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { enGB } from "date-fns/locale/en-GB";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { api } from "../../api";
import { checkoutFor, dayStr, fromApiDay, nightsBetween } from "../../utils";

const BookingCard = ({ booking, editable, onChanged, index = 0 }) => {
  const [mode, setMode] = useState(null); // "dates" | "cancel" | null
  const [range, setRange] = useState([
    { startDate: fromApiDay(booking.checkIn), endDate: fromApiDay(booking.checkOut), key: "selection" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const checkIn = fromApiDay(booking.checkIn);
  const checkOut = fromApiDay(booking.checkOut);
  const perNight = booking.rooms.reduce((s, r) => s + r.price, 0);
  const newNights = nightsBetween(range[0].startDate, range[0].endDate);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      setMode(null);
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveDates = () =>
    run(() =>
      api(`/bookings/${booking._id}`, {
        method: "PUT",
        body: {
          checkIn: dayStr(range[0].startDate),
          checkOut: dayStr(checkoutFor(range[0].startDate, range[0].endDate)),
        },
      })
    );

  const cancel = () => run(() => api(`/bookings/${booking._id}/cancel`, { method: "POST" }));

  return (
    <article className={`bookingItem ${booking.status === "cancelled" ? "isCancelled" : ""}`} style={{ "--i": Math.min(index, 8) }}>
      <Link to={`/hotels/${booking.hotel}`} className="bookingImgLink">
        {booking.hotelPhoto ? <img src={booking.hotelPhoto} alt="" className="bookingImg" /> : <div className="bookingImg" />}
      </Link>
      <div className="bookingMain">
        <div className="bookingTop">
          <div>
            <Link to={`/hotels/${booking.hotel}`} className="bookingHotel">
              {booking.hotelName}
            </Link>
            <div className="muted bookingCity">{booking.hotelCity}</div>
          </div>
          <span className={`statusPill ${booking.status}`}>{booking.status}</span>
        </div>

        <div className="bookingFacts">
          <div>
            <small>Check-in</small>
            {format(checkIn, "EEE d MMM yyyy")}
          </div>
          <div>
            <small>Check-out</small>
            {format(checkOut, "EEE d MMM yyyy")}
          </div>
          <div>
            <small>Rooms</small>
            {booking.rooms.map((r) => `${r.title} #${r.number}`).join(", ")}
          </div>
          <div>
            <small>Total</small>
            <b>${booking.total}</b> <span className="muted">({booking.nights} night{booking.nights > 1 ? "s" : ""})</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {mode === "dates" && (
          <div className="bookingEdit">
            <DateRange
              onChange={(item) => setRange([item.selection])}
              minDate={new Date()}
              ranges={range}
              locale={enGB}
              moveRangeOnFirstSelection={false}
              rangeColors={["#0a3d8f"]}
            />
            <div className="bookingEditSide">
              <p>
                New stay: <b>{newNights}</b> night{newNights > 1 ? "s" : ""}
              </p>
              <p>
                New total: <b>${perNight * newNights}</b>
              </p>
              <button className="btn btn-primary btn-block" disabled={busy} onClick={saveDates}>
                {busy ? "Saving…" : "Save new dates"}
              </button>
              <button className="btn btn-outline btn-block" disabled={busy} onClick={() => setMode(null)}>
                Keep current dates
              </button>
            </div>
          </div>
        )}

        {mode === "cancel" && (
          <div className="bookingConfirm">
            <span>Cancel this reservation? The rooms will be released.</span>
            <div className="bookingActions">
              <button className="btn btn-danger" disabled={busy} onClick={cancel}>
                {busy ? "Cancelling…" : "Yes, cancel"}
              </button>
              <button className="btn btn-outline" disabled={busy} onClick={() => setMode(null)}>
                No, keep it
              </button>
            </div>
          </div>
        )}

        {!mode && (
          <div className="bookingActions">
            {editable && (
              <>
                <button className="btn btn-outline" onClick={() => setMode("dates")}>
                  Change dates
                </button>
                <button className="btn btn-outline btn-danger-outline" onClick={() => setMode("cancel")}>
                  Cancel reservation
                </button>
              </>
            )}
            {booking.status === "confirmed" && (
              <Link to={`/hotels/${booking.hotel}#reviews`} className="btn btn-outline">
                Write a review
              </Link>
            )}
            <span className="muted bookingRef">Ref: {booking._id.slice(-8).toUpperCase()}</span>
          </div>
        )}
      </div>
    </article>
  );
};

export default BookingCard;
