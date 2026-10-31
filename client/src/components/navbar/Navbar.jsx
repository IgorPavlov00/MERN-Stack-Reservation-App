import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navContainer">
        <Link to="/" className="logo">
          <FontAwesomeIcon icon={faHotel} />
          <span>Staybook</span>
        </Link>
        <nav className="navItems">
          <Link to="/hotels" className="navLink">
            Browse stays
          </Link>
          {user ? (
            <>
              <Link to="/account" className="navUser" title="My trips & profile">
                <span className="navAvatar">{user.username[0]?.toUpperCase()}</span>
                <span className="navUserName">{user.username}</span>
              </Link>
              <button className="btn btn-ghost-light navBtn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span className="navBtnText">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-ghost-light navBtn">
                Register
              </Link>
              <Link to="/login" className="btn btn-light navBtn">
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
