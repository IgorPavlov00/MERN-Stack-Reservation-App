import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUserGroup, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import useFetch from "../../hooks/useFetch";
import { useSearch } from "../../context/SearchContext";
import { api } from "../../api";
import { nightsInRange } from "../../utils";
import "./reserve.css";

const Reserve = ({ hotelId, onClose }) => {
  const { dates } = useSearch();
  const { data: rooms, loading, error, reFetch } = useFetch(`/hotels/room/${hotelId}`);
  const [selected, setSelected] = useState([]); // [{ id, price }]
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const nights = useMemo(() => nightsInRange(dates[0].startDate, dates[0].endDate), [dates]);
  const nightTimes = useMemo(() => new Set(nights.map((d) => d.getTime())), [nights]);
  const checkout = useMemo(() => {
    const d = new Date(nights[nights.length - 1]);
    d.setDate(d.getDate() + 1);
    return d;
  }, [nights]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isAvailable = (roomNumber) =>
    !roomNumber.unavailableDates.some((d) => nightTimes.has(new Date(d).getTime()));

  const isSelected = (id) => selected.some((s) => s.id === id);
  const toggle = (id, price) =>
    setSelected((prev) => (isSelected(id) ? prev.filter((s) => s.id !== id) : [...prev, { id, price }]));

  const total = selected.reduce((sum, s) => sum + s.price, 0) * nights.length;

  const handleReserve = async () => {
    setStatus({ state: "saving", message: "" });
    const results = await Promise.allSettled(
      selected.map(({ id }) =>
        api(`/rooms/availability/${id}`, {
          method: "PUT",
          body: { dates: nights.map((d) => d.toISOString()) },
        })
      )
    );
    const failed = results.filter((r) => r.status === "rejected");
    reFetch();
    if (failed.length === 0) {
      setStatus({
        state: "done",
        message: `${selected.length} room${selected.length > 1 ? "s" : ""} booked · $${total} total`,
      });
    } else {
      setStatus({
        state: "error",
        message:
          failed.length === results.length
            ? failed[0].reason.message
            : `${results.length - failed.length} room(s) booked, ${failed.length} failed: ${failed[0].reason.message}`,
      });
    }
    setSelected([]);
  };

  return (
    <div className="reserve" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reserve-title">
      <div className="rContainer" onClick={(e) => e.stopPropagation()}>
        <div className="rHeader">
          <div>
            <h2 className="rHeading" id="reserve-title">
              Select your rooms
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
            <p className="muted">{status.message}</p>
            <button className="btn btn-primary btn-lg" onClick={onClose}>
              Done
            </button>
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
                      const active = isSelected(rn._id);
                      return (
                        <button
                          type="button"
                          key={rn._id}
                          className={`roomChip ${active ? "active" : ""}`}
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
