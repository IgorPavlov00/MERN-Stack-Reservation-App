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

export const AuthProvider = ({ children }) => {
  // The httpOnly cookie is the real credential; this is just the profile to display.
  const [user, setUser] = useState(readStored);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  }, [user]);

  const login = useCallback(async (credentials) => {
    const res = await api("/auth/login", { method: "POST", body: credentials });
    setUser({ ...res.details, isAdmin: res.isAdmin });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
