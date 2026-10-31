import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faEarthEurope, faStar, faComments } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Featured from "../../components/featured/Featured";
import PropertyList from "../../components/propertyList/PropertyList";
import FeaturedProperties from "../../components/featuredProperties/featuredProperties";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import { Reveal, CountUp } from "../../components/motion/Motion";
import useFetch from "../../hooks/useFetch";
import "./home.css";

const Section = ({ title, subtitle, children }) => (
  <Reveal as="section" className="container section">
    <div className="sectionHead">
      <h2 className="sectionTitle">{title}</h2>
      {subtitle && <p className="sectionSubtitle">{subtitle}</p>}
    </div>
    {children}
  </Reveal>
);

// Live numbers from the API, counted up when they scroll into view.
const Stats = () => {
  const { data } = useFetch("/hotels?limit=100");
  const hotels = data ?? [];
  const rated = hotels.filter((h) => h.rating != null);
  const stats = [
    [faHotel, data ? hotels.length : null, 0, "", "Properties"],
    [faEarthEurope, data ? new Set(hotels.map((h) => h.city.toLowerCase())).size : null, 0, "", "Destinations"],
    [faStar, data && rated.length ? (rated.reduce((s, h) => s + h.rating, 0) / rated.length) * 2 : null, 1, "", "Average guest score"],
    [faComments, data ? hotels.reduce((s, h) => s + (h.reviewCount || 0), 0) : null, 0, "", "Guest reviews"],
  ];
  return (
    <Reveal className="container">
      <div className="stats">
        {stats.map(([icon, value, decimals, suffix, label], i) => (
          <div className="stat stagger" style={{ "--i": i }} key={label}>
            <span className="statIcon">
              <FontAwesomeIcon icon={icon} />
            </span>
            <div>
              <div className="statValue">
                <CountUp value={value} decimals={decimals} suffix={suffix} />
              </div>
              <div className="statLabel">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
};

const Home = () => {
  return (
    <div className="page">
      <Navbar />
      <main>
        <Header />
        <Stats />
        <Section title="Trending destinations" subtitle="Most popular choices for travellers right now">
          <Featured />
        </Section>
        <Section title="Browse by property type">
          <PropertyList />
        </Section>
        <Section title="Homes guests love" subtitle="Hand-picked stays with top guest ratings">
          <FeaturedProperties />
        </Section>
        <Reveal>
          <MailList />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
