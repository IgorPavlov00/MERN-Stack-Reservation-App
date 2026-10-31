import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import "./auth.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/auth/register", { method: "POST", body: form });
      await login({ username: form.username, password: form.password });
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
          <h1 className="authTitle">Create your account</h1>
          <p className="authSub">It is free and takes less than a minute.</p>
          <div className="field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              className="input"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="input"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-lg btn-block" disabled={loading} type="submit">
            {loading ? "Creating account…" : "Create account"}
          </button>
          <p className="authSwitch">
            Already have an account?{" "}
            <Link to="/login" state={location.state}>
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Register;
