import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { ratingLabel, score } from "../../utils";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch("/hotels?featured=true&limit=8");

  if (error) return <p className="muted">Could not load properties.</p>;
  if (!loading && !data.length)
    return (
      <div className="emptyState">
        <h3>No featured stays yet</h3>
        <p>Check back soon.</p>
      </div>
    );

  return (
    <div className="fpGrid">
      {loading
        ? Array.from({ length: 4 }, (_, i) => <div key={i} className="fpSkeleton skeleton" />)
        : data.map((hotel) => (
            <Link to={`/hotels/${hotel._id}`} className="fpCard" key={hotel._id}>
              <div className="fpImgWrap">
                <img src={hotel.photos?.[0]} alt="" className="fpImg" loading="lazy" />
                <span className="tag fpType">{hotel.type}</span>
              </div>
              <div className="fpBody">
                <h3 className="fpName">{hotel.name}</h3>
                <span className="fpCity">{hotel.city}</span>
                {hotel.rating != null && (
                  <div className="fpRating">
                    <span className="scoreBadge">{score(hotel.rating)}</span>
                    <span className="fpRatingLabel">{ratingLabel(hotel.rating)}</span>
                  </div>
                )}
                <div className="fpPrice">
                  <span className="muted">From</span> <b>${hotel.cheapestPrice}</b>
                  <span className="muted"> / night</span>
                </div>
              </div>
            </Link>
          ))}
    </div>
  );
};

export default FeaturedProperties;
