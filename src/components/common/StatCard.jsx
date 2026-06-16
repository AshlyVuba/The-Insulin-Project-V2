 import React from "react";

const colorMap = { blue: "#1A365D", sky: "#00B4D8", green: "#2d8a4e", amber: "#b07218" };

export default function StatCard({ label, value, color = "blue" }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "#718096", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: colorMap[color] || colorMap.blue }}>
        {value}
      </div>
    </div>
  );
}
