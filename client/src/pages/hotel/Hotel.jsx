import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faXmark,
  faLocationDot,
  faWifi,
  faSquareParking,
  faMugHot,
  faSnowflake,
  faBanSmoking,
  faTaxi,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { enGB } from "date-fns/locale/en-GB";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Reserve from "../../components/reserve/Reserve";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { nightsBetween, ratingLabel, score } from "../../utils";
import "./hotel.css";

const AMENITIES = [
  [faWifi, "Free Wi-Fi"],
  [faSquareParking, "Free parking"],
  [faMugHot, "Breakfast available"],
  [faSnowflake, "Air conditioning"],
  [faBanSmoking, "Non-smoking rooms"],
  [faTaxi, "Airport shuttle"],
];

const Hotel = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const search = useSearch();
  const { dates, options } = search;
  const [slide, setSlide] = useState(null); // index of open photo, or null
  const [reserveOpen, setReserveOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const { data, loading, error } = useFetch(`/hotels/find/${id}`);

  const nights = nightsBetween(dates[0].startDate, dates[0].endDate);
  const photos = data?.photos ?? [];
  const move = (step) => setSlide((n) => (n + step + photos.length) % photos.length);

  useEffect(() => {
    if (slide === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSlide(null);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (data?.name) document.title = `${data.name} · Staybook`;
    return () => {
      document.title = "Staybook - Hotel reservations";
    };
  }, [data?.name]);

  const handleReserve = () => {
    if (user) setReserveOpen(true);
    else navigate("/login", { state: { from: location.pathname } });
  };

  const total = nights * (data?.cheapestPrice ?? 0) * options.room;

  return (
    <div className="page">
      <Navbar />
      <main className="container hotelPage">
        {loading ? (
          <>
            <div className="skeleton" style={{ height: 36, width: "40%", marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 420 }} />
          </>
        ) : error ? (
          <div className="emptyState">
            <h3>
              {error.status === 404 || error.status === 400
                ? "We could not find that property"
                : "Something went wrong"}
            </h3>
            <p>{error.status === 404 || error.status === 400 ? "It may have been removed." : error.message}</p>
            <Link to="/hotels" className="btn btn-outline" style={{ marginTop: 16 }}>
              Browse all stays
            </Link>
          </div>
        ) : (
          <>
            <nav className="breadcrumbs">
              <Link to="/">Home</Link> <span>/</span>{" "}
              <Link to={`/hotels?city=${encodeURIComponent(data.city)}`}>{data.city}</Link> <span>/</span>{" "}
              <span className="muted">{data.name}</span>
            </nav>

            <div className="hotelHead">
              <div>
                <span className="tag">{data.type}</span>
                <h1 className="hotelTitle">{data.name}</h1>
                <div className="hotelAddress">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>
                    {data.address ? `${data.address}, ` : ""}
                    {data.city} · {data.distance}m from centre
                  </span>
                </div>
              </div>
              {data.rating != null && (
                <div className="hotelScore">
                  <div>
                    <div className="hotelScoreLabel">{ratingLabel(data.rating)}</div>
                    <div className="muted hotelScoreSub">Guest rating</div>
                  </div>
                  <span className="scoreBadge">{score(data.rating)}</span>
                </div>
              )}
            </div>

            {photos.length > 0 && (
              <div className={`gallery count-${Math.min(photos.length, 5)}`}>
                {photos.slice(0, 5).map((p, i) => (
                  <button type="button" key={p + i} className="galleryItem" onClick={() => setSlide(i)}>
                    <img src={p} alt={`${data.name} photo ${i + 1}`} />
                  </button>
                ))}
                <button type="button" className="btn btn-light galleryAll" onClick={() => setSlide(0)}>
                  <FontAwesomeIcon icon={faImages} /> Show all photos
                </button>
              </div>
            )}

            <div className="hotelBody">
              <div className="hotelInfo">
                <h2 className="hotelSubTitle">{data.title}</h2>
                <p className="hotelDesc">{data.description}</p>

                <h3 className="hotelSectionTitle">Popular amenities</h3>
                <ul className="amenities">
                  {AMENITIES.map(([icon, label]) => (
                    <li key={label}>
                      <FontAwesomeIcon icon={icon} /> {label}
                    </li>
                  ))}
                </ul>

                <div className="alert alert-success highlight">
                  Book a stay of 2+ nights here and get a free airport taxi.
                </div>
              </div>

              <aside className="bookingCard">
                <div className="bookingPrice">
                  <b>${data.cheapestPrice}</b> <span className="muted">/ night</span>
                </div>

                <div className="bookingDates">
                  <button type="button" className="bookingDateBtn" onClick={() => setDateOpen(!dateOpen)}>
                    <span>
                      <small>Check-in</small>
                      {format(dates[0].startDate, "EEE d MMM")}
                    </span>
                    <span>
                      <small>Check-out</small>
                      {format(dates[0].endDate, "EEE d MMM")}
                    </span>
                  </button>
                  {dateOpen && (
                    <div className="bookingCalendar">
                      <DateRange
                        onChange={(item) => search.setSearch({ ...search, dates: [item.selection] })}
                        minDate={new Date()}
                        ranges={dates}
                        locale={enGB}
                        moveRangeOnFirstSelection={false}
                        rangeColors={["#0a3d8f"]}
                      />
                      <button type="button" className="btn btn-outline btn-block" onClick={() => setDateOpen(false)}>
                        Done
                      </button>
                    </div>
                  )}
                </div>

                <div className="bookingLine">
                  <span>
                    ${data.cheapestPrice} × {nights} night{nights > 1 ? "s" : ""}
                    {options.room > 1 ? ` × ${options.room} rooms` : ""}
                  </span>
                  <span>${total}</span>
                </div>
                <div className="bookingLine bookingTotal">
                  <span>Estimated total</span>
                  <span>${total}</span>
                </div>
                <button className="btn btn-primary btn-lg btn-block" onClick={handleReserve}>
                  {user ? "Reserve rooms" : "Sign in to reserve"}
                </button>
                <p className="bookingNote">You will choose your rooms in the next step.</p>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />

      {slide !== null && photos.length > 0 && (
        <div className="slider" onClick={() => setSlide(null)}>
          <button className="sliderBtn close" onClick={() => setSlide(null)} aria-label="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <button
            className="sliderBtn prev"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            aria-label="Previous photo"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <img src={photos[slide]} alt="" className="sliderImg" onClick={(e) => e.stopPropagation()} />
          <button
            className="sliderBtn next"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            aria-label="Next photo"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <div className="sliderCount">
            {slide + 1} / {photos.length}
          </div>
        </div>
      )}
      {reserveOpen && <Reserve hotelId={id} onClose={() => setReserveOpen(false)} />}
    </div>
  );
};

export default Hotel;
