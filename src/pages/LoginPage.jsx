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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy mb-4">
            <span className="text-sky text-2xl font-black">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-navy">First Response Express</h1>
          <p className="text-muted text-sm mt-1">Clinic Staff Portal</p>
        </div>

        <div className="panel p-6">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.gov.za"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-slate-50 border border-border rounded-lg p-3 text-xs text-muted">
          <p className="font-semibold text-gray-600 mb-1">Demo credentials</p>
          <p>filing@clinic.gov.za / password123</p>
          <p>pharmacy@clinic.gov.za / password123</p>
          <p>admin@clinic.gov.za / password123</p>
        </div>
      </div>
    </div>
  );
}
