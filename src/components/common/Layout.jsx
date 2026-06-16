import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccessRoute } from "../../utils/roleRoutes";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { to: "/admin", label: "Admin", roles: ["admin"] },
    { to: "/filing", label: "Filing Room", roles: ["filing"] },
    { to: "/pharmacy", label: "Pharmacy Kanban", roles: ["pharmacy"] },
  ].filter((item) => canAccessRoute(user?.role, item.roles));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <header style={{ background: "#1A365D", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, color: "#00B4D8" }}>FRE</span>
          <span style={{ color: "#fff", fontWeight: 500, fontSize: 16 }}>First Response Express</span>
          <span style={{ background: "#00B4D8", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>BETA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{user?.clinic}</span>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00B4D8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 600 }}>
            {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{user?.name}</span>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 }}>
            Logout
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ background: "#F8FAFC", borderBottom: "1px solid #e2e8f0", display: "flex" }}>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: "12px 20px",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              color: isActive ? "#1A365D" : "#718096",
              borderBottom: isActive ? "2px solid #1A365D" : "2px solid transparent",
              background: isActive ? "#fff" : "transparent",
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      <main style={{ flex: 1, padding: "1.25rem 1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
