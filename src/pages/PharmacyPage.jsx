import React, { useState, useCallback } from "react";
import { usePharmacy } from "../hooks/usePharmacy";
import StatCard from "../components/common/StatCard";
import Toast from "../components/common/Toast";
import Icon from "../components/common/Icon";

const EMPTY_ORDER = {
  name: "",
  ref: "",
  medication: "",
  pickup_time: "",
  temp: "2-8 C",
};

function KanbanCard({ order, onMove, onNotify }) {
  const isIncoming = order.status === "incoming";

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{order.name}</div>
          <div style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>{order.medication}</div>
        </div>
        <span style={refStyle}>{order.ref}</span>
      </div>

      <span style={{ display: "inline-flex", background: "#e6f1fb", color: "#185FA5", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
        Temp {order.temp}
      </span>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 11, color: "#718096" }}>{order.pickup_time}</span>
        {isIncoming ? (
          <button
            onClick={() => { onMove(order.id, "ready"); onNotify(`${order.name} moved to Ready`); }}
            style={outlineBtn("#185FA5", "#e6f1fb", "#b5d4f4")}
          >
            Mark Ready
          </button>
        ) : (
          <button
            onClick={() => { onMove(order.id, "collected"); onNotify(`${order.name} collected`); }}
            style={outlineBtn("#0F6E56", "#E1F5EE", "#9FE1CB")}
          >
            Collected
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ title, orders, color, countBg, onMove, onNotify, emptyMsg }) {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13, color }}>
          {title}
          <span style={{ background: countBg, color: "#fff", fontSize: 11, padding: "1px 8px", borderRadius: 20 }}>
            {orders.length}
          </span>
        </div>
      </div>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#718096", fontSize: 13 }}>{emptyMsg}</div>
        ) : (
          orders.map((o) => <KanbanCard key={o.id} order={o} onMove={onMove} onNotify={onNotify} />)
        )}
      </div>
    </div>
  );
}

export default function PharmacyPage() {
  const { incoming, ready, loading, error, moveOrder, createOrder, refresh } = usePharmacy();
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTempForm, setShowTempForm] = useState(false);
  const [fridgeTemp, setFridgeTemp] = useState("4.2");
  const [tempInput, setTempInput] = useState("4.2");
  const [form, setForm] = useState(EMPTY_ORDER);
  const notify = useCallback((msg) => setToast(msg), []);

  const openForm = () => {
    setForm({
      ...EMPTY_ORDER,
      ref: `FRE-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setShowForm(true);
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createOrder(form);
    setShowForm(false);
    notify(`Pharmacy order created for ${form.name}`);
  };

  const handleTempSubmit = (e) => {
    e.preventDefault();
    setFridgeTemp(tempInput);
    setShowTempForm(false);
    notify(`Fridge temperature updated to ${tempInput} C`);
  };

  if (error) return <div style={{ color: "#a32d2d", padding: "2rem", textAlign: "center" }}>{error}</div>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
        <StatCard label="Incoming to Pack" value={incoming.length} color="blue" />
        <StatCard label="Ready for Pickup" value={ready.length} color="green" />
        <StatCard label="Collected Today" value={6} color="sky" />
        <StatCard label="Fridge Temp" value={`${fridgeTemp} C`} color="sky" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1A365D", margin: 0 }}>Pharmacy Workflow</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={refresh} style={btn("#00B4D8")}><ButtonIcon name="refresh" label="Refresh" /></button>
          <button onClick={() => setShowTempForm(true)} style={btn("#1A365D")}><ButtonIcon name="temp" label="Update Temp" /></button>
          <button onClick={openForm} style={btn("#2d8a4e")}><ButtonIcon name="add" label="Add Order" /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#718096" }}>Loading pharmacy orders...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <KanbanColumn
            title="Incoming - To Pack"
            orders={incoming}
            color="#1A365D"
            countBg="#00B4D8"
            onMove={moveOrder}
            onNotify={notify}
            emptyMsg="All incoming orders packed"
          />
          <KanbanColumn
            title="Ready for Pickup"
            orders={ready}
            color="#2d8a4e"
            countBg="#2d8a4e"
            onMove={moveOrder}
            onNotify={notify}
            emptyMsg="No orders ready yet"
          />
        </div>
      )}

      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: 10 }}>
        <button title="Pack all incoming" aria-label="Pack all incoming" onClick={() => notify("All incoming packed and moved to ready")} style={fab("#2d8a4e")}><Icon name="check" /></button>
        <button title="Print ready list" aria-label="Print ready list" onClick={() => notify("Print list generated")} style={fab("#00B4D8")}><Icon name="printer" /></button>
        <button title="New order" aria-label="New order" onClick={openForm} style={fab("#1A365D")}><Icon name="add" /></button>
      </div>

      {showForm && (
        <OrderModal
          form={form}
          onChange={updateForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

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

function OrderModal({ form, onChange, onClose, onSubmit }) {
  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: "#1A365D", fontSize: 18 }}>New Pharmacy Order</h3>
            <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 12 }}>
              This maps cleanly to POST /pharmacy/orders for the backend.
            </p>
          </div>
          <button onClick={onClose} style={closeBtn}>Close</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <FormField label="Patient name" value={form.name} onChange={(value) => onChange("name", value)} required />
          <FormField label="Fast-track ref" value={form.ref} onChange={(value) => onChange("ref", value)} required />
          <FormField label="Medication" value={form.medication} onChange={(value) => onChange("medication", value)} required />
          <FormField label="Pickup time" value={form.pickup_time} onChange={(value) => onChange("pickup_time", value)} placeholder="Today 11:30" required />
          <FormField label="Cold-chain range" value={form.temp} onChange={(value) => onChange("temp", value)} required />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
            <button type="submit" style={btn("#1A365D")}>Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, required }) {
  return (
    <label style={{ display: "grid", gap: 5, fontSize: 12, color: "#4a5568", fontWeight: 600 }}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
      />
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

function TempModal({ value, onChange, onClose, onSubmit }) {
  return (
    <div style={modalBackdrop}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: "#1A365D", fontSize: 18 }}>Update Fridge Temperature</h3>
            <p style={{ margin: "4px 0 0", color: "#718096", fontSize: 12 }}>
              Insulin cold-chain storage should remain in the 2-8 C range.
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

const refStyle = { fontFamily: "monospace", fontSize: 11, background: "#eef2f7", padding: "2px 7px", borderRadius: 5, color: "#1A365D" };
const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 10px", fontSize: 13, outlineColor: "#00B4D8" };
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

function outlineBtn(color, bg, border) {
  return { color, background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" };
}

function fab(bg) {
  return { width: 46, height: 46, borderRadius: 8, background: bg, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
}
