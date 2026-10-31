import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const needsPassword = form.email.trim() !== user.email || form.newPassword !== "";
  const changed = form.username.trim() !== user.username || needsPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setStatus({ state: "error", message: "The new passwords do not match." });
      return;
    }
    setStatus({ state: "saving", message: "" });
    try {
      await updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        ...(form.newPassword && { newPassword: form.newPassword }),
        ...(needsPassword && { currentPassword: form.currentPassword }),
      });
      setForm((f) => ({ ...f, newPassword: "", confirmPassword: "", currentPassword: "" }));
      setStatus({ state: "done", message: "Your profile has been updated." });
    } catch (err) {
      setStatus({ state: "error", message: err.message });
    }
  };

  return (
    <form className="profileForm" onSubmit={handleSubmit}>
      <section className="profileSection">
        <h2>Personal details</h2>
        <div className="profileGrid">
          <div className="field">
            <label htmlFor="pf-username">Username</label>
            <input id="pf-username" className="input" name="username" value={form.username} onChange={set} required minLength={3} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="pf-email">Email</label>
            <input id="pf-email" className="input" type="email" name="email" value={form.email} onChange={set} required autoComplete="email" />
          </div>
        </div>
      </section>

      <section className="profileSection">
        <h2>Change password</h2>
        <p className="muted">Leave blank to keep your current password.</p>
        <div className="profileGrid">
          <div className="field">
            <label htmlFor="pf-new">New password</label>
            <input id="pf-new" className="input" type="password" name="newPassword" value={form.newPassword} onChange={set} minLength={6} autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="pf-confirm">Confirm new password</label>
            <input id="pf-confirm" className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={set} autoComplete="new-password" />
          </div>
        </div>
      </section>

      {needsPassword && (
        <section className="profileSection">
          <div className="field" style={{ maxWidth: 360 }}>
            <label htmlFor="pf-current">Current password (required to change email or password)</label>
            <input id="pf-current" className="input" type="password" name="currentPassword" value={form.currentPassword} onChange={set} required autoComplete="current-password" />
          </div>
        </section>
      )}

      {status.state === "error" && <div className="alert alert-error">{status.message}</div>}
      {status.state === "done" && <div className="alert alert-success">{status.message}</div>}

      <div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={!changed || status.state === "saving"}>
          {status.state === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
