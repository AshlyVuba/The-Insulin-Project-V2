import React, { useState, useCallback } from "react";
import { useFiling } from "../hooks/useFiling";
import StatCard from "../components/common/StatCard";
import Toast from "../components/common/Toast";
import Icon from "../components/common/Icon";

const STATUS_PILL = {
  urgent: { bg: "#fde8e8", color: "#a32d2d", label: "Urgent" },
  today: { bg: "#e6f1fb", color: "#185FA5", label: "Due Today" },
  upcoming: { bg: "#EAF3DE", color: "#3B6D11", label: "Upcoming" },
};

const EMPTY_ENTRY = {
  name: "",
  ref: "",
  pickup_date: "",
  medication: "",
  status: "today",
  pulled: false,
};

export default function FilingRoomPage() {
  const { files, loading, error, markPulled, sendReminder, createFastTrackEntry, refresh } = useFiling();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_ENTRY);

  const notify = useCallback((msg) => setToast(msg), []);

  const openForm = () => {
    setForm({
      ...EMPTY_ENTRY,
      ref: `FRE-${Math.floor(1000 + Math.random() * 9000)}`,
      pickup_date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createFastTrackEntry(form);
    setShowForm(false);
    notify(`Fast-track entry created for ${form.name}`);
  };

  const handlePull = async (id, name) => {
    await markPulled(id);
    notify(`File for ${name} marked as pulled`);
  };

  const handleReminder = async (id, name) => {
    await sendReminder(id);
    notify(`SMS reminder sent to ${name}`);
  };

  const filtered = files.filter((f) => {
    if (filter === "pulled") return f.pulled;
    if (filter !== "all" && f.status !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search) && !f.ref.toLowerCase().includes(search)) return false;
    return true;
  });

  const stats = {
    total: files.filter((f) => !f.pulled && (f.status === "today" || f.status === "urgent")).length,
    confirmed: files.length,
    pulled: files.filter((f) => f.pulled).length,
    urgent: files.filter((f) => f.status === "urgent" && !f.pulled).length,
  };

  if (error) return <div style={{ color: "#a32d2d", padding: "2rem", textAlign: "center" }}>{error}</div>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
        <StatCard label="Files to Pull Today" value={stats.total} color="blue" />
        <StatCard label="Confirmed Pickups" value={stats.confirmed} color="sky" />
        <StatCard label="Already Pulled" value={stats.pulled} color="green" />
        <StatCard label="Urgent Overdue" value={stats.urgent} color="amber" />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
        {["all", "urgent", "today", "upcoming", "pulled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid",
              borderColor: filter === f ? "#1A365D" : "#e2e8f0",
              background: filter === f ? "#1A365D" : "transparent",
              color: filter === f ? "#fff" : "#718096",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", background: "#F8FAFC", borderBottom: "1px solid #e2e8f0" }}>
          <input
            type="text"
            placeholder="Search patient name or ref code..."
            value={search}
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            style={{ flex: 1, padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}
          />
          <button onClick={refresh} style={btn("#00B4D8")}><ButtonIcon name="refresh" label="Refresh" /></button>
          <button onClick={openForm} style={btn("#2d8a4e")}><ButtonIcon name="add" label="New Fast-track" /></button>
          <button style={btn("#1A365D")}><ButtonIcon name="download" label="Export" /></button>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#718096" }}>Loading files...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #e2e8f0" }}>
                {["Patient", "Ref Code", "Pickup Date", "Medication", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#718096", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const pill = f.pulled ? { bg: "#E1F5EE", color: "#0F6E56", label: "Pulled" } : STATUS_PILL[f.status];
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: "10px 14px" }}><span style={refStyle}>{f.ref}</span></td>
                    <td style={{ padding: "10px 14px", color: "#4a5568" }}>{f.pickup_date}</td>
                    <td style={{ padding: "10px 14px", color: "#718096", fontSize: 12 }}>{f.medication}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: pill.bg, color: pill.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {pill.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!f.pulled && <button onClick={() => handlePull(f.id, f.name)} style={smallBtn("#2d8a4e")}><ButtonIcon name="check" label="Pull" /></button>}
                        <button onClick={() => handleReminder(f.id, f.name)} style={smallBtn("#00B4D8")}><ButtonIcon name="message" label="Reminder" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#718096" }}>No files match your filter.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: 10 }}>
        <button title="Mark all pulled" aria-label="Mark all pulled" onClick={() => notify("All pending files marked as pulled")} style={fab("#2d8a4e")}><Icon name="check" /></button>
        <button title="Bulk reminder" aria-label="Bulk reminder" onClick={() => notify("SMS reminders sent to all patients")} style={fab("#00B4D8")}><Icon name="message" /></button>
        <button title="New fast-track entry" aria-label="New fast-track entry" onClick={openForm} style={fab("#1A365D")}><Icon name="add" /></button>
      </div>

      {showForm && (
        <FastTrackModal
          form={form}
          onChange={updateForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

function FastTrackModal({ form, onChange, onClose, onSubmit }) {
  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: "#1A365D", fontSize: 18 }}>New Fast-track Entry</h3>
            <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 12 }}>
              This maps cleanly to POST /filing/files for the backend.
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>Close</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <FormField label="Patient name" value={form.name} onChange={(value) => onChange("name", value)} required />
          <FormField label="Fast-track ref" value={form.ref} onChange={(value) => onChange("ref", value)} required />
          <FormField label="Pickup date" type="date" value={form.pickup_date} onChange={(value) => onChange("pickup_date", value)} required />
          <FormField label="Medication" value={form.medication} onChange={(value) => onChange("medication", value)} required />

          <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#4a5568", fontWeight: 600 }}>
            Filing priority
            <select value={form.status} onChange={(e) => onChange("status", e.target.value)} style={inputStyle}>
              <option value="today">Due Today</option>
              <option value="urgent">Urgent</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button type="submit" style={btn("#1A365D")}>Create Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, type = "text", value, onChange, required }) {
  return (
    <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#4a5568", fontWeight: 600 }}>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} style={inputStyle} />
    </label>
  );
}

function ButtonIcon({ name, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon name={name} size={15} />
      {label}
    </span>
  );
}

const refStyle = { fontFamily: "monospace", fontSize: 12, background: "#eef2f7", padding: "2px 8px", borderRadius: 5, color: "#1A365D" };
const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 10px", fontSize: 13, outlineColor: "#00B4D8", background: "#fff" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 };
const modalCard = { width: "min(520px, 100%)", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18, boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)" };
const closeBtn = { background: "#F8FAFC", color: "#4a5568", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 };
const secondaryBtn = { ...closeBtn, padding: "8px 12px", fontWeight: 600 };

function btn(bg) {
  return { background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
}

function smallBtn(bg) {
  return { background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" };
}

function fab(bg) {
  return { width: 46, height: 46, borderRadius: 8, background: bg, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
}