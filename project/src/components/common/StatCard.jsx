import React from "react";

const colorMap = {
  blue:  "text-navy",
  sky:   "text-sky",
  green: "text-green",
  amber: "text-amber",
};

export default function StatCard({ label, value, color = "blue" }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${colorMap[color] || colorMap.blue}`}>{value}</div>
    </div>
  );
}
