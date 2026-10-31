import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);
const KEY = "user";

const readStored = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

const toUser = (res) => ({ ...res.details, isAdmin: res.isAdmin });

export const AuthProvider = ({ children }) => {
  // The httpOnly cookie is the real credential; this is the cached profile to display.
  const [user, setUser] = useState(readStored);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  }, [user]);

  // On load, confirm the session is still valid (cookie may have expired).
  useEffect(() => {
    if (!readStored()) return;
    api("/auth/me")
      .then((res) => setUser(toUser(res)))
      .catch((err) => {
        if (err.status === 401 || err.status === 403) setUser(null);
      });
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api("/auth/login", { method: "POST", body: credentials });
    setUser(toUser(res));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (changes) => {
      const res = await api(`/users/${user._id}`, { method: "PUT", body: changes });
      setUser(toUser(res));
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
