import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(() => sessionStorage.getItem("fre_token"));
  const [user, setUser]       = useState(() => {
    const u = sessionStorage.getItem("fre_user");
    return u ? JSON.parse(u) : null;
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(email, password);
      sessionStorage.setItem("fre_token", data.access_token);
      sessionStorage.setItem("fre_user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("fre_token");
    sessionStorage.removeItem("fre_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);