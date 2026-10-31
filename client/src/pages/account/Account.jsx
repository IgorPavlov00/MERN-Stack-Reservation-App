import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSuitcaseRolling, faUser } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import BookingCard from "./BookingCard";
import ProfileForm from "./ProfileForm";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { apiDay, dayStr } from "../../utils";
import "./account.css";

const TABS = [
  ["trips", "My trips", faSuitcaseRolling],
  ["profile", "Profile", faUser],
];

const Trips = () => {
  const { data, loading, error, reFetch } = useFetch("/bookings/mine");

  if (loading) return <div className="skeleton" style={{ height: 160 }} />;
  if (error) return <div className="alert alert-error">{error.message}</div>;

  const today = dayStr(new Date());
  const upcoming = data
    .filter((b) => b.status === "confirmed" && apiDay(b.checkIn) >= today)
    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
  const past = data.filter((b) => b.status === "confirmed" && apiDay(b.checkIn) < today);
  const cancelled = data.filter((b) => b.status === "cancelled");

  if (!data.length)
    return (
      <div className="emptyState">
        <h3>No trips yet</h3>
        <p>When you book a stay, it will show up here.</p>
        <Link to="/hotels" className="btn btn-primary" style={{ marginTop: 16 }}>
          Find a place to stay
        </Link>
      </div>
    );

  const group = (title, list, editable) =>
    list.length > 0 && (
      <section className="tripGroup">
        <h2 className="tripGroupTitle">
          {title} <span className="muted">({list.length})</span>
        </h2>
        {list.map((b, i) => (
          <BookingCard key={b._id} index={i} booking={b} editable={editable} onChanged={reFetch} />
        ))}
      </section>
    );

  return (
    <>
      {group("Upcoming", upcoming, true)}
      {group("Past stays", past, false)}
      {group("Cancelled", cancelled, false)}
    </>
  );
};

const Account = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "profile" ? "profile" : "trips";

  if (!user) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  return (
    <div className="page">
      <Navbar />
      <main className="container accountPage">
        <div className="accountHead">
          <span className="accountAvatar">{user.username[0]?.toUpperCase()}</span>
          <div>
            <h1 className="accountName">{user.username}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map(([key, label, icon]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`tab ${tab === key ? "active" : ""}`}
              onClick={() => setParams(key === "trips" ? {} : { tab: key })}
            >
              <FontAwesomeIcon icon={icon} /> {label}
            </button>
          ))}
        </div>

        <div className="accountBody">{tab === "trips" ? <Trips /> : <ProfileForm />}</div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
