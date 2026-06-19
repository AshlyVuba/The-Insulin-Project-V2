import React from "react";
import Icon from "../components/common/Icon";

function PlaceholderPage({ title, icon, description, color }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
        style={{ background: color }}
      >
        <Icon name={icon} size={28} />
      </div>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="text-muted text-sm max-w-xs">{description}</p>
      <span className="text-xs font-mono bg-slate-100 text-navy px-3 py-1 rounded-full">
        Coming in next sprint
      </span>
    </div>
  );
}

export function FilingRoomPage() {
  return (
    <PlaceholderPage
      title="Filing Room"
      icon="package"
      description="Pull patient files, send SMS reminders, and manage fast-track entries for express insulin pickups."
      color="#1A365D"
    />
  );
}

export function PharmacyPage() {
  return (
    <PlaceholderPage
      title="Pharmacy Kanban"
      icon="package"
      description="Move orders from incoming through packing to ready for pickup. Cold-chain temp tracked per order."
      color="#00B4D8"
    />
  );
}

export function AdminPage() {
  return (
    <PlaceholderPage
      title="Admin Command Center"
      icon="chart"
      description="Clinic-wide oversight: live patient flow, compliance, team control, and audit trail."
      color="#2d8a4e"
    />
  );
}
