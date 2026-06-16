import React, { useMemo, useState } from "react";
import StatCard from "../components/common/StatCard";
import Toast from "../components/common/Toast";
import Icon from "../components/common/Icon";

const TODAY_QUEUE = [
  { id: 1, name: "Nomsa Dlamini", ref: "FRE-0041", role: "Filing + Pharmacy", status: "At risk", pickup: "Today 10:00", medication: "Insulin Glargine", action: "File not pulled, pack pending" },
  { id: 2, name: "Thabo Khumalo", ref: "FRE-0042", role: "Pharmacy", status: "Packing", pickup: "Today 11:30", medication: "Insulin Actrapid", action: "Cold-chain pack in progress" },
  { id: 3, name: "Zanele Mokoena", ref: "FRE-0043", role: "Ready", status: "Ready", pickup: "Today 09:00", medication: "Metformin + Insulin", action: "Fast-track desk ready" },
  { id: 4, name: "Bongani Ndlovu", ref: "FRE-0046", role: "Filing", status: "Overdue", pickup: "Today 14:00", medication: "Insulin Aspart", action: "Escalate file retrieval" },
];

const CLINIC_TEAMS = [
  { name: "Filing Room", lead: "Nandi Sithole", openTasks: 6, risk: "2 overdue files", status: "Needs support" },
  { name: "Pharmacy", lead: "Dr. K. Molefe", openTasks: 8, risk: "Fridge capacity 78%", status: "Operational" },
  { name: "Fast-track Desk", lead: "S. Maseko", openTasks: 4, risk: "Peak at 11:00", status: "Ready" },
  { name: "Messaging Bot", lead: "Automated", openTasks: 23, risk: "5 unconfirmed", status: "Monitoring" },
];

const AUDIT_EVENTS = [
  "Admin reviewed overdue insulin pickups",
  "Bulk WhatsApp reminder approved for unconfirmed patients",
  "Cold-chain exception checked: fridge stable at 4.2 C",
  "Filing room workload balanced for 10:00-12:00 peak",
];

export default function AdminPage() {
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");
  const [showTempForm, setShowTempForm] = useState(false);
  const [fridgeTemp, setFridgeTemp] = useState("4.2");
  const [tempInput, setTempInput] = useState("4.2");

  const filteredQueue = useMemo(() => {
    if (filter === "all") return TODAY_QUEUE;
    return TODAY_QUEUE.filter((item) => item.status.toLowerCase() === filter);
  }, [filter]);

  const notify = (message) => setToast(message);

  const handleTempSubmit = (e) => {
    e.preventDefault();
    setFridgeTemp(tempInput);
    setShowTempForm(false);
    notify(`Fridge temperature updated to ${tempInput} C`);
  };

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 700, color: "#1A365D", margin: 0 }}>
            Admin Command Center
          </h1>
          <p style={{ color: "#718096", fontSize: 13, margin: "6px 0 0" }}>
            Clinic-wide oversight for express insulin pickup, filing readiness, pharmacy packing, cold-chain safety, and POPIA-aware audit activity.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => notify("Daily operations report exported")} style={btn("#1A365D")}><ButtonIcon name="download" label="Export Report" /></button>
          <button onClick={() => notify("Bulk reminder queued for unconfirmed patients")} style={btn("#00B4D8")}><ButtonIcon name="message" label="Bulk Reminder" /></button>
          <button onClick={() => setShowTempForm(true)} style={btn("#1A365D")}><ButtonIcon name="temp" label="Update Temp" /></button>
          <button onClick={() => notify("Critical queue review started")} style={btn("#2d8a4e")}><ButtonIcon name="review" label="Start Review" /></button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
        <StatCard label="Express Pickups Today" value={42} color="blue" />
        <StatCard label="Files Pending Pull" value={6} color="amber" />
        <StatCard label="Packs Ready" value={18} color="green" />
        <StatCard label="Cold-chain Temp" value={`${fridgeTemp} C`} color="sky" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: "1rem", marginBottom: "1rem" }}>
        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={headingStyle}>Live Patient Flow</h2>
              <p style={subTextStyle}>Admin can intervene across filing, pharmacy, messaging, and fast-track arrival.</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["all", "overdue", "at risk", "packing", "ready"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  style={{
                    border: "1px solid",
                    borderColor: filter === item ? "#1A365D" : "#e2e8f0",
                    background: filter === item ? "#1A365D" : "#fff",
                    color: filter === item ? "#fff" : "#718096",
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {titleCase(item)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #e2e8f0" }}>
                  {["Patient", "Ref", "Pickup", "Medication", "Status", "Admin Action"].map((head) => (
                    <th key={head} style={thStyle}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStrongStyle}>{item.name}</td>
                    <td style={tdStyle}><span style={refStyle}>{item.ref}</span></td>
                    <td style={tdStyle}>{item.pickup}</td>
                    <td style={tdStyle}>{item.medication}</td>
                    <td style={tdStyle}><StatusPill status={item.status} /></td>
                    <td style={tdStyle}>
                      <button onClick={() => notify(`${item.ref}: ${item.action}`)} style={smallBtn("#00B4D8")}>
                        Intervene
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={headingStyle}>Safety & Compliance</h2>
              <p style={subTextStyle}>Operational controls for health data and medication safety.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <ComplianceItem label="POPIA minimum data display" value="Active" tone="green" />
            <ComplianceItem label="JWT session protection" value="Required" tone="blue" />
            <ComplianceItem label="Audit trail coverage" value="98%" tone="green" />
            <ComplianceItem label="Cold-chain status" value={Number(fridgeTemp) >= 2 && Number(fridgeTemp) <= 8 ? "In range" : "Review needed"} tone={Number(fridgeTemp) >= 2 && Number(fridgeTemp) <= 8 ? "green" : "amber"} />
            <ComplianceItem label="Unconfirmed patients" value="5 pending" tone="amber" />
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={headingStyle}>Clinic Team Control</h2>
              <p style={subTextStyle}>View workload by operational unit and trigger admin support.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {CLINIC_TEAMS.map((team) => (
              <div key={team.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1A365D", fontSize: 13 }}>{team.name}</div>
                  <div style={{ color: "#718096", fontSize: 12, marginTop: 3 }}>
                    Lead: {team.lead} | Open tasks: {team.openTasks} | {team.risk}
                  </div>
                </div>
                <button onClick={() => notify(`${team.name}: admin support requested`)} style={smallBtn(team.status === "Needs support" ? "#b07218" : "#2d8a4e")}>
                  {team.status}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={headingStyle}>Audit Activity</h2>
              <p style={subTextStyle}>High-level admin actions without exposing unnecessary patient details.</p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {AUDIT_EVENTS.map((event, index) => (
              <div key={event} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: index === AUDIT_EVENTS.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#e6f1fb", color: "#185FA5", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {index + 1}
                </span>
                <div>
                  <div style={{ fontSize: 13, color: "#1a202c" }}>{event}</div>
                  <div style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>Today | Admin User | Diepsloot CHC</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showTempForm && (
        <TempModal
          value={tempInput}
          onChange={setTempInput}
          onClose={() => setShowTempForm(false)}
          onSubmit={handleTempSubmit}
        />
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    Overdue: { bg: "#fde8e8", color: "#a32d2d" },
    "At risk": { bg: "#fff4d6", color: "#8a5a00" },
    Packing: { bg: "#e6f1fb", color: "#185FA5" },
    Ready: { bg: "#E1F5EE", color: "#0F6E56" },
  };
  const style = styles[status] || styles.Ready;

  return (
    <span style={{ background: style.bg, color: style.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  );
}

function ComplianceItem({ label, value, tone }) {
  const colors = {
    green: "#2d8a4e",
    blue: "#00B4D8",
    amber: "#b07218",
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
      <span style={{ color: "#4a5568", fontSize: 13 }}>{label}</span>
      <span style={{ color: colors[tone], fontWeight: 700, fontSize: 13 }}>{value}</span>
    </div>
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

function TempModal({ value, onChange, onClose, onSubmit }) {
  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: "#1A365D", fontSize: 18 }}>Update Fridge Temperature</h3>
            <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 12 }}>
              Admin can record a manual cold-chain check while other stats sync from the database.
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>Close</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#4a5568", fontWeight: 600 }}>
            Current fridge temperature (C)
            <input
              type="number"
              min="0"
              max="12"
              step="0.1"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button type="submit" style={btn("#1A365D")}>Save Temperature</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  overflow: "hidden",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 13,
  outlineColor: "#00B4D8",
  background: "#fff",
};

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
};

const modalCard = {
  width: "min(480px, 100%)",
  background: "#fff",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  padding: 18,
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
};

const closeBtn = {
  background: "#F8FAFC",
  color: "#4a5568",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  fontSize: 12,
};

const secondaryBtn = {
  ...closeBtn,
  padding: "8px 12px",
  fontWeight: 600,
};

const panelHeaderStyle = {
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  borderBottom: "1px solid #e2e8f0",
};

const headingStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#1A365D",
  margin: 0,
};

const subTextStyle = {
  color: "#718096",
  fontSize: 12,
  margin: "4px 0 0",
};

const thStyle = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "#718096",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "10px 14px",
  color: "#4a5568",
};

const tdStrongStyle = {
  padding: "10px 14px",
  color: "#1a202c",
  fontWeight: 600,
};

const refStyle = {
  fontFamily: "monospace",
  fontSize: 12,
  background: "#eef2f7",
  padding: "2px 8px",
  borderRadius: 5,
  color: "#1A365D",
};

function btn(bg) {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
}

function smallBtn(bg) {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}