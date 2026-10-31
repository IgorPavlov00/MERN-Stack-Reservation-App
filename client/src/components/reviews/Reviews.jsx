import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { ratingLabel } from "../../utils";
import "./reviews.css";

const SCORES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const ReviewForm = ({ hotelId, existing, onSaved }) => {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  useEffect(() => {
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? "");
  }, [existing?._id, existing?.rating, existing?.comment]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setStatus({ state: "error", message: "Please choose a score." });
      return;
    }
    setStatus({ state: "saving", message: "" });
    try {
      await api(`/hotels/${hotelId}/reviews`, { method: "POST", body: { rating, comment } });
      setStatus({ state: "done", message: existing ? "Your review was updated." : "Thanks for your review!" });
      onSaved();
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <form className="reviewForm" onSubmit={submit}>
      <h3>{existing ? "Edit your review" : "Write a review"}</h3>
      <div className="field">
        <label>Your score</label>
        <div className="scorePicker" role="radiogroup" aria-label="Score from 1 to 10">
          {SCORES.slice().reverse().map((s) => (
            <button
              type="button"
              key={s}
              role="radio"
              aria-checked={rating === s}
              className={`scoreOption ${rating === s ? "active" : ""}`}
              onClick={() => setRating(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {rating > 0 && <span className="muted scoreHint">{ratingLabel(rating / 2)}</span>}
      </div>
      <div className="field">
        <label htmlFor="review-comment">Your review</label>
        <textarea
          id="review-comment"
          className="input textarea"
          rows={4}
          maxLength={1000}
          placeholder="What did you like? What could be better?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          minLength={3}
        />
      </div>
      {status.state === "error" && <div className="alert alert-error">{status.message}</div>}
      {status.state === "done" && <div className="alert alert-success">{status.message}</div>}
      <div>
        <button className="btn btn-primary" type="submit" disabled={status.state === "saving"}>
          {status.state === "saving" ? "Posting…" : existing ? "Update review" : "Post review"}
        </button>
      </div>
    </form>
  );
};

const Reviews = ({ hotelId, onChanged }) => {
  const { user } = useAuth();
  const location = useLocation();
  const ref = useRef(null);
  const { data, loading, error, reFetch } = useFetch(`/hotels/${hotelId}/reviews`);
  const [deleting, setDeleting] = useState(null);

  // Support links like /hotels/:id#reviews
  useEffect(() => {
    if (location.hash === "#reviews" && data) ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [location.hash, data]);

  const refresh = () => {
    reFetch();
    onChanged?.();
  };

  const remove = async (id) => {
    setDeleting(id);
    try {
      await api(`/reviews/${id}`, { method: "DELETE" });
      refresh();
    } finally {
      setDeleting(null);
    }
  };

  const mine = data?.find((r) => r.user === user?._id);
  const avg = data?.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : null;

  return (
    <section className="reviews" id="reviews" ref={ref}>
      <div className="reviewsHead">
        <h2 className="hotelSubTitle">Guest reviews</h2>
        {avg != null && (
          <div className="reviewsSummary">
            <span className="scoreBadge">{avg.toFixed(1)}</span>
            <span>
              <b>{ratingLabel(avg / 2)}</b> · {data.length} review{data.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {user ? (
        <ReviewForm hotelId={hotelId} existing={mine} onSaved={refresh} />
      ) : (
        <div className="alert alert-info">
          <Link to="/login" state={{ from: `${location.pathname}#reviews` }}>
            Sign in
          </Link>{" "}
          to write a review.
        </div>
      )}

      {loading && !data ? (
        <div className="skeleton" style={{ height: 100 }} />
      ) : error ? (
        <div className="alert alert-error">Could not load reviews.</div>
      ) : data.length === 0 ? (
        <p className="muted">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <ul className="reviewList">
          {data.map((r) => (
            <li key={r._id} className="reviewItem">
              <div className="reviewTop">
                <span className="reviewAvatar">{r.username[0]?.toUpperCase()}</span>
                <div className="reviewWho">
                  <b>{r.username}</b>
                  <span className="muted">
                    {formatDistanceToNow(new Date(r.updatedAt), { addSuffix: true })}
                    {r.verified && (
                      <span className="verified">
                        <FontAwesomeIcon icon={faCircleCheck} /> Verified stay
                      </span>
                    )}
                  </span>
                </div>
                <span className="scoreBadge">{r.rating}</span>
              </div>
              <p className="reviewText">{r.comment}</p>
              {(r.user === user?._id || user?.isAdmin) && (
                <button className="reviewDelete" onClick={() => remove(r._id)} disabled={deleting === r._id}>
                  <FontAwesomeIcon icon={faTrashCan} /> {deleting === r._id ? "Deleting…" : "Delete"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Reviews;
