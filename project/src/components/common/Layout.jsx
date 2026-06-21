import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { canAccessRoute } from "../../utils/roleRoutes";
import { getInitials } from "../../utils/helpers";
import Icon from "./Icon";

const NAV_ITEMS = [
  { to: "/admin",    label: "Admin",            roles: ["admin"] },
  { to: "/filing",   label: "Filing Room",       roles: ["filing"] },
  { to: "/pharmacy", label: "Pharmacy Kanban",   roles: ["pharmacy"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleNav = NAV_ITEMS.filter((item) =>
    canAccessRoute(user?.role, item.roles)
  );

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">

      {/* ── Top bar ── */}
      <header className="bg-navy h-14 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sky font-bold text-xl tracking-tight">FRE</span>
          <span className="text-white font-medium text-sm">First Response Express</span>
          <span className="bg-sky/20 text-sky text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
            BETA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs hidden sm:block">{user?.clinic}</span>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-sky flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>

          <span className="text-white/80 text-xs hidden sm:block">{user?.name}</span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer bg-transparent"
          >
            <Icon name="logout" size={13} />
            Logout
          </button>
        </div>
      </header>

      {/* ── Sub-nav ── */}
      <nav className="bg-white border-b border-border flex">
        {visibleNav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-5 py-3 text-sm font-medium transition-colors ${
                isActive ? "nav-link-active" : "nav-link-inactive"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1 p-5">
        <Outlet />
      </main>
    </div>
  );
}
