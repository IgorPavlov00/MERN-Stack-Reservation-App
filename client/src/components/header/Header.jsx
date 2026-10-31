import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faCalendarDays,
  faUserGroup,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { enGB } from "date-fns/locale/en-GB";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./header.css";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";

const OPTION_FIELDS = [
  ["adult", "Adults", "Ages 13 or above", 1],
  ["children", "Children", "Ages 0-12", 0],
  ["room", "Rooms", "", 1],
];

// Close a popover when clicking outside of it.
const useOutsideClick = (ref, onOutside) => {
  useEffect(() => {
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onOutside();
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
};

const Header = () => {
  const search = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(search.city);
  const [date, setDate] = useState(search.dates);
  const [options, setOptions] = useState(search.options);
  const [open, setOpen] = useState(null); // "date" | "options" | null
  const dateRef = useRef(null);
  const optionsRef = useRef(null);

  useOutsideClick(dateRef, () => open === "date" && setOpen(null));
  useOutsideClick(optionsRef, () => open === "options" && setOpen(null));

  const changeOption = (name, delta) =>
    setOptions((prev) => ({ ...prev, [name]: prev[name] + delta }));

  const handleSearch = (e) => {
    e?.preventDefault();
    const city = destination.trim();
    search.setSearch({ city, dates: date, options });
    navigate(city ? `/hotels?city=${encodeURIComponent(city)}` : "/hotels");
  };

  return (
    <section className="hero">
      <div className="container heroInner">
        <h1 className="heroTitle">Find your next stay</h1>
        <p className="heroDesc">
          Search hotels, apartments, resorts and more, and book in a couple of clicks.
        </p>
        {!user && (
          <button className="btn btn-accent heroCta" onClick={() => navigate("/register")}>
            Create a free account
          </button>
        )}
      </div>

      <div className="container">
        <form className="searchBar" onSubmit={handleSearch}>
          <label className="searchField">
            <FontAwesomeIcon icon={faLocationDot} className="searchIcon" />
            <span className="searchFieldBody">
              <span className="searchLabel">Destination</span>
              <input
                type="text"
                placeholder="Where are you going?"
                className="searchInput"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </span>
          </label>

          <div className="searchField" ref={dateRef}>
            <FontAwesomeIcon icon={faCalendarDays} className="searchIcon" />
            <button
              type="button"
              className="searchFieldBody searchToggle"
              onClick={() => setOpen(open === "date" ? null : "date")}
            >
              <span className="searchLabel">Check-in — Check-out</span>
              <span className="searchValue">
                {format(date[0].startDate, "EEE, d MMM")} — {format(date[0].endDate, "EEE, d MMM")}
              </span>
            </button>
            {open === "date" && (
              <div className="popover">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setDate([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={date}
                  minDate={new Date()}
                  locale={enGB}
                  rangeColors={["#0a3d8f"]}
                />
              </div>
            )}
          </div>

          <div className="searchField" ref={optionsRef}>
            <FontAwesomeIcon icon={faUserGroup} className="searchIcon" />
            <button
              type="button"
              className="searchFieldBody searchToggle"
              onClick={() => setOpen(open === "options" ? null : "options")}
            >
              <span className="searchLabel">Guests</span>
              <span className="searchValue">
                {options.adult} adult{options.adult > 1 ? "s" : ""} · {options.children} child
                {options.children === 1 ? "" : "ren"} · {options.room} room{options.room > 1 ? "s" : ""}
              </span>
            </button>
            {open === "options" && (
              <div className="popover options">
                {OPTION_FIELDS.map(([key, label, hint, min]) => (
                  <div className="optionItem" key={key}>
                    <div>
                      <div className="optionText">{label}</div>
                      {hint && <div className="optionHint">{hint}</div>}
                    </div>
                    <div className="optionCounter">
                      <button
                        type="button"
                        disabled={options[key] <= min}
                        className="optionCounterButton"
                        onClick={() => changeOption(key, -1)}
                        aria-label={`Fewer ${label.toLowerCase()}`}
                      >
                        −
                      </button>
                      <span className="optionCounterNumber">{options[key]}</span>
                      <button
                        type="button"
                        className="optionCounterButton"
                        onClick={() => changeOption(key, 1)}
                        aria-label={`More ${label.toLowerCase()}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-block" onClick={() => setOpen(null)}>
                  Done
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-lg searchSubmit" type="submit">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            Search
          </button>
        </form>
      </div>
    </section>
  );
};

export default Header;
