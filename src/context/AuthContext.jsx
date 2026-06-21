import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

// MOCK_USERS removed! We are now using real backend authentication.

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("fre_token"));
  const [user, setUser]   = useState(() => {
    const u = sessionStorage.getItem("fre_user");
    return u ? JSON.parse(u) : null;
  });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Security Ticket 1 Execution: Real API Call to FastAPI
      // FastAPI's OAuth2PasswordBearer expects form data, not JSON!
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // Strip trailing /api or /api/v1 suffix if someone accidentally included it in the env var
      const rawUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const BACKEND_URL = rawUrl.replace(/\/api(\/v1)?$/, "");

      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        // Catches the 401 Unauthorized from your security.py file
        setError("Invalid email or password.");
        return null;
      }

      // Expected Backend Response:
      // { "access_token": "eyJhb...", "token_type": "bearer", "user": { "role": "filing", "name": "Nandi" } }
      const data = await response.json();

      // Store the real JWT securely
      sessionStorage.setItem("fre_token", data.access_token);
      sessionStorage.setItem("fre_user", JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);

      return data.user;
    } catch (err) {
      setError("Network error. Could not connect to the authentication server.");
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