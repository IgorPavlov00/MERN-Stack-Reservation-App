import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel } from "@fortawesome/free-solid-svg-icons";
import "./footer.css";

const TYPES = [
  ["hotel", "Hotels"],
  ["apartment", "Apartments"],
  ["resort", "Resorts"],
  ["villa", "Villas"],
  ["cabin", "Cabins"],
];
const CITIES = ["Madrid", "London", "Dubai", "Berlin", "Budapest", "Austin"];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container fInner">
        <div className="fBrand">
          <Link to="/" className="fLogo">
            <FontAwesomeIcon icon={faHotel} /> Staybook
          </Link>
          <p>Find and book places to stay around the world.</p>
        </div>
        <div className="fLists">
          <div>
            <h4>Property types</h4>
            <ul>
              {TYPES.map(([type, label]) => (
                <li key={type}>
                  <Link to={`/hotels?type=${type}`}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Destinations</h4>
            <ul>
              {CITIES.map((c) => (
                <li key={c}>
                  <Link to={`/hotels?city=${c}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li>
                <Link to="/login">Sign in</Link>
              </li>
              <li>
                <Link to="/register">Create account</Link>
              </li>
              <li>
                <Link to="/hotels">Browse all stays</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container fBottom">© {new Date().getFullYear()} Staybook · A MERN stack demo project</div>
    </footer>
  );
};

export default Footer;
