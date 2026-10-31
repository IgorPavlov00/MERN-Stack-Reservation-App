import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FadeImg } from "../motion/Motion";
import "./featured.css";

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

const CITIES = [
  { name: "Madrid", country: "Spain", img: photo("1539037116277-4db20889f2d4") },
  { name: "London", country: "United Kingdom", img: photo("1513635269975-59663e0ac1ad") },
  { name: "Dubai", country: "United Arab Emirates", img: photo("1512453979798-5ea266f8880c") },
  { name: "Berlin", country: "Germany", img: photo("1560969184-10fe8719e047") },
  { name: "Budapest", country: "Hungary", img: photo("1565426873118-a17ed65d74b9") },
  { name: "Austin", country: "United States", img: photo("1588993608283-7f0eda4438be") },
];

const plural = (n) => `${n} ${n === 1 ? "property" : "properties"}`;

const Featured = () => {
  const navigate = useNavigate();
  const { data, loading } = useFetch(
    `/hotels/countByCity?cities=${CITIES.map((c) => c.name).join(",")}`
  );

  return (
    <div className="featured">
      {CITIES.map((city, i) => (
        <button
          type="button"
          className={`featuredItem stagger shine ${i < 2 ? "large" : ""}`}
          style={{ "--i": i }}
          key={city.name}
          onClick={() => navigate(`/hotels?city=${encodeURIComponent(city.name)}`)}
        >
          <FadeImg src={city.img} alt="" className="featuredImg" loading="lazy" />
          <div className="featuredTitles">
            <h3>{city.name}</h3>
            <span>
              {city.country} · {loading ? "…" : plural(data?.[i] ?? 0)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default Featured;
