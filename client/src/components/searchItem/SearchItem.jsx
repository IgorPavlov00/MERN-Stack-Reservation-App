import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ratingLabel, score } from "../../utils";
import "./searchItem.css";

const formatDistance = (m) => {
  const n = Number(m);
  if (!Number.isFinite(n)) return m;
  return n >= 1000 ? `${(n / 1000).toFixed(1)} km` : `${n} m`;
};

const SearchItem = ({ item }) => {
  return (
    <article className="searchItem">
      <Link to={`/hotels/${item._id}`} className="siImgLink">
        <img src={item.photos?.[0]} alt="" className="siImg" loading="lazy" />
      </Link>
      <div className="siDesc">
        <div className="siHead">
          <div>
            <Link to={`/hotels/${item._id}`} className="siTitle">
              {item.name}
            </Link>
            <div className="siDistance">
              <FontAwesomeIcon icon={faLocationDot} /> {item.city} · {formatDistance(item.distance)} from centre
            </div>
          </div>
          {item.rating != null && (
            <div className="siRating">
              <span className="siRatingLabel">{ratingLabel(item.rating)}</span>
              <span className="scoreBadge">{score(item.rating)}</span>
            </div>
          )}
        </div>
        <span className="tag">{item.type}</span>
        <p className="siSubtitle">{item.title}</p>
        <p className="siFeatures">{item.description}</p>
        <div className="siFoot">
          <div className="siPerks">
            <span>
              <FontAwesomeIcon icon={faCheck} /> Free cancellation
            </span>
            <span>
              <FontAwesomeIcon icon={faCheck} /> No prepayment needed
            </span>
          </div>
          <div className="siPriceBox">
            <div className="siPrice">${item.cheapestPrice}</div>
            <div className="siTaxOp">per night, taxes included</div>
            <Link to={`/hotels/${item._id}`} className="btn btn-primary siCheckButton">
              See availability
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SearchItem;
