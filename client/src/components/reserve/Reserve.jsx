import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserGroup, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import useFetch from "../../hooks/useFetch";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { apiDay, checkoutFor, dayStr, nightsInRange } from "../../utils";
import "./reserve.css";

const Reserve = ({ hotelId, onClose }) => {
  const { dates } = useSearch();
  const { user } = useAuth();
  const { data: rooms, loading, error, reFetch } = useFetch(`/hotels/room/${hotelId}`);
  const [selected, setSelected] = useState([]); // [{ id, price }]
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [booking, setBooking] = useState(null);

  const nights = useMemo(() => nightsInRange(dates[0].startDate, dates[0].endDate), [dates]);
  const nightKeys = useMemo(() => new Set(nights.map(dayStr)), [nights]);
  const checkout = useMemo(() => checkoutFor(dates[0].startDate, dates[0].endDate), [dates]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isAvailable = (roomNumber) => !roomNumber.unavailableDates.some((d) => nightKeys.has(apiDay(d)));

  const isSelected = (id) => selected.some((s) => s.id === id);
  const toggle = (id, price) =>
    setSelected((prev) => (isSelected(id) ? prev.filter((s) => s.id !== id) : [...prev, { id, price }]));

  const total = selected.reduce((sum, s) => sum + s.price, 0) * nights.length;

  const handleReserve = async () => {
    setStatus({ state: "saving", message: "" });
    try {
      const created = await api("/bookings", {
        method: "POST",
        body: {
          hotelId,
          roomNumberIds: selected.map((s) => s.id),
          checkIn: dayStr(nights[0]),
          checkOut: dayStr(checkout),
        },
      });
      setBooking(created);
      setStatus({ state: "done", message: "" });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
      reFetch();
    }
    setSelected([]);
  };

  return (
    <div className="reserve" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reserve-title">
      <div className="rContainer" onClick={(e) => e.stopPropagation()}>
        <div className="rHeader">
          <div>
            <h2 className="rHeading" id="reserve-title">
              {status.state === "done" ? "Booking complete" : "Select your rooms"}
            </h2>
            <p className="rDates">
              {format(nights[0], "EEE d MMM")} → {format(checkout, "EEE d MMM yyyy")} · {nights.length}{" "}
              {nights.length === 1 ? "night" : "nights"}
            </p>
          </div>
          <button className="rClose" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {status.state === "done" ? (
          <div className="rSuccess">
            <FontAwesomeIcon icon={faCircleCheck} className="rSuccessIcon" />
            <h3>Your reservation is confirmed!</h3>
            <p className="muted">
              {booking.rooms.length} room{booking.rooms.length > 1 ? "s" : ""} · ${booking.total} total
            </p>
            <p className="muted rSmall">
              A confirmation email is on its way to <b>{user?.email}</b>.
            </p>
            <div className="rSuccessActions">
              <Link to="/account" className="btn btn-primary btn-lg">
                View my trips
              </Link>
              <button className="btn btn-outline btn-lg" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rBody">
              {loading && <div className="skeleton" style={{ height: 120 }} />}
              {error && <div className="alert alert-error">{error.message}</div>}
              {rooms?.length === 0 && <p className="muted">This property has no rooms listed yet.</p>}
              {rooms?.map((room) => (
                <div className="rItem" key={room._id}>
                  <div className="rItemInfo">
                    <div className="rTitle">{room.title}</div>
                    <div className="rDesc">{room.desc}</div>
                    <div className="rMeta">
                      <span>
                        <FontAwesomeIcon icon={faUserGroup} /> Up to {room.maxPeople}
                      </span>
                      <span className="rPrice">${room.price} / night</span>
                    </div>
                  </div>
                  <div className="rSelectRooms">
                    {room.roomNumbers.map((rn) => {
                      const available = isAvailable(rn);
                      return (
                        <button
                          type="button"
                          key={rn._id}
                          className={`roomChip ${isSelected(rn._id) ? "active" : ""}`}
                          disabled={!available}
                          onClick={() => toggle(rn._id, room.price)}
                          title={available ? `Room ${rn.number}` : `Room ${rn.number} is booked for these dates`}
                        >
                          {rn.number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {status.state === "error" && <div className="alert alert-error">{status.message}</div>}
            </div>

            <div className="rFooter">
              <div>
                <div className="rTotal">{selected.length ? `$${total}` : "—"}</div>
                <div className="muted rTotalSub">
                  {selected.length
                    ? `${selected.length} room${selected.length > 1 ? "s" : ""} · ${nights.length} night${nights.length > 1 ? "s" : ""}`
                    : "Pick one or more room numbers"}
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleReserve}
                disabled={!selected.length || status.state === "saving"}
              >
                {status.state === "saving" ? "Reserving…" : "Reserve now"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reserve;
