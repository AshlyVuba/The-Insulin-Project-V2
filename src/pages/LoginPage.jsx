import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomeRouteForRole } from "../utils/roleRoutes";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(email, password);
    if (user) navigate(getHomeRouteForRole(user.role));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "2rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A365D", margin: 0 }}>First Response Express</h1>
          <p style={{ color: "#718096", fontSize: 13, marginTop: 4 }}>Clinic Staff Portal</p>
        </div>

        {error && (
          <div style={{ background: "#fde8e8", color: "#a32d2d", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#4a5568", display: "block", marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.gov.za"
              required
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#4a5568", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: loading ? "#94a3b8" : "#1A365D", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", background: "#f8fafc", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#718096" }}>
          <strong>Demo credentials:</strong><br />
          filing@clinic.gov.za / password123<br />
          pharmacy@clinic.gov.za / password123<br />
          admin@clinic.gov.za / password123
        </div>
      </div>
    </div>
  );
}