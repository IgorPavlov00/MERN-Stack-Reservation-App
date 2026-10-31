import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { enGB } from "date-fns/locale/en-GB";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/navbar/Navbar";
import SearchItem from "../../components/searchItem/SearchItem";
import Footer from "../../components/footer/Footer";
import useFetch from "../../hooks/useFetch";
import { useSearch } from "../../context/SearchContext";
import "./list.css";

const TYPES = ["hotel", "apartment", "resort", "villa", "cabin"];

const List = () => {
  const search = useSearch();
  const [params, setParams] = useSearchParams();

  // Filter form state; applied to the URL (and the API query) on submit.
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [dates, setDates] = useState(search.dates);
  const [openDate, setOpenDate] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the form in sync when the URL changes (e.g. footer / destination links).
  useEffect(() => {
    setCity(params.get("city") ?? "");
    setType(params.get("type") ?? "");
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
  }, [params]);

  const { data, loading, error } = useFetch(`/hotels?${params.toString()}`);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (city.trim()) next.set("city", city.trim());
    if (type) next.set("type", type);
    if (min) next.set("min", min);
    if (max) next.set("max", max);
    setParams(next);
    search.setSearch({ ...search, city: city.trim(), dates });
    setOpenDate(false);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  const heading = params.get("city")
    ? `Stays in ${params.get("city").replace(/\b\w/g, (c) => c.toUpperCase())}`
    : params.get("type")
    ? `${params.get("type")[0].toUpperCase()}${params.get("type").slice(1)}s`
    : "All stays";

  return (
    <div className="page">
      <Navbar />
      <main className="container listPage">
        <div className="listTop">
          <div>
            <h1 className="listHeading">{heading}</h1>
            <p className="muted">
              {format(search.dates[0].startDate, "EEE d MMM")} – {format(search.dates[0].endDate, "EEE d MMM")}
              {" · "}
              {search.options.adult + search.options.children} guest
              {search.options.adult + search.options.children > 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn btn-outline filtersToggle" onClick={() => setFiltersOpen(!filtersOpen)}>
            <FontAwesomeIcon icon={faSliders} /> Filters
          </button>
        </div>

        <div className="listWrapper">
          <form className={`listSearch ${filtersOpen ? "open" : ""}`} onSubmit={applyFilters}>
            <h2 className="lsTitle">Filter results</h2>
            <div className="field">
              <label htmlFor="ls-city">Destination</label>
              <input id="ls-city" className="input" value={city} placeholder="Any city" onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="field lsDateField">
              <label>Dates</label>
              <button type="button" className="input lsDates" onClick={() => setOpenDate(!openDate)}>
                {format(dates[0].startDate, "d MMM")} – {format(dates[0].endDate, "d MMM yyyy")}
              </button>
              {openDate && (
                <div className="lsCalendar">
                  <DateRange
                    onChange={(item) => setDates([item.selection])}
                    minDate={new Date()}
                    ranges={dates}
                    locale={enGB}
                    rangeColors={["#0a3d8f"]}
                  />
                </div>
              )}
            </div>
            <div className="field">
              <label>Property type</label>
              <div className="lsChips">
                <button type="button" className={`chip ${type === "" ? "active" : ""}`} onClick={() => setType("")}>
                  Any
                </button>
                {TYPES.map((t) => (
                  <button type="button" key={t} className={`chip ${type === t ? "active" : ""}`} onClick={() => setType(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Price per night ($)</label>
              <div className="lsPrice">
                <input className="input" type="number" min={0} placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" />
                <span className="muted">–</span>
                <input className="input" type="number" min={0} placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Apply filters
            </button>
            <button className="btn btn-outline btn-block" type="button" onClick={clearFilters}>
              Clear all
            </button>
          </form>

          <section className="listResult">
            {loading ? (
              Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton resultSkeleton" />)
            ) : error ? (
              <div className="alert alert-error">Something went wrong: {error.message}</div>
            ) : data.length === 0 ? (
              <div className="emptyState">
                <h3>No properties found</h3>
                <p>Try another destination, a different property type or a wider price range.</p>
                <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={clearFilters}>
                  Show all stays
                </button>
              </div>
            ) : (
              <>
                <p className="lrCount">
                  {data.length} {data.length === 1 ? "property" : "properties"} found
                </p>
                {data.map((item) => (
                  <SearchItem item={item} key={item._id} />
                ))}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default List;
