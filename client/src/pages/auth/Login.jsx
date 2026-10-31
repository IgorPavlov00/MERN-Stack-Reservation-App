import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setCredentials((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(credentials);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="auth">
        <form className="authContainer" onSubmit={handleSubmit}>
          <h1 className="authTitle">Welcome back</h1>
          <p className="authSub">Sign in to manage and make reservations.</p>
          {location.state?.from && <div className="alert alert-info">Please sign in to reserve a room.</div>}
          <div className="field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="input"
              name="username"
              autoComplete="username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              name="password"
              type="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="authSwitch">
            New to Staybook?{" "}
            <Link to="/register" state={location.state}>
              Create an account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Login;
