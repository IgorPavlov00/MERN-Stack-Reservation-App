import { Link } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const NotFound = () => (
  <div className="page">
    <Navbar />
    <main className="container" style={{ paddingTop: 64 }}>
      <div className="emptyState">
        <h3>Page not found</h3>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Back to the homepage
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
