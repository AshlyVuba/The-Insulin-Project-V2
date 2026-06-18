import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

const MOCK_USERS = {
  "filing@clinic.gov.za":   { name: "Nandi Sithole",  role: "filing",   clinic: "Tshwane Municipality Clinic" },
  "pharmacy@clinic.gov.za": { name: "Dr. K. Molefe",  role: "pharmacy", clinic: "Tshwane Municipality Clinic" },
  "admin@clinic.gov.za":    { name: "Admin User",      role: "admin",    clinic: "Tshwane Municipality Clinic" },
};

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
      await new Promise((r) => setTimeout(r, 600));
      const mockUser = MOCK_USERS[email];
      if (!mockUser || password !== "password123") {
        setError("Invalid email or password.");
        return null;
      }
      const access_token = "mock-jwt-" + Date.now();
      sessionStorage.setItem("fre_token", access_token);
      sessionStorage.setItem("fre_user", JSON.stringify(mockUser));
      setToken(access_token);
      setUser(mockUser);
      return mockUser;
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
