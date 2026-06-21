import React, { useState, useEffect, useCallback } from "react";
import Icon from "../components/common/Icon";

// ─── PlaceholderPage (still used by Filing/Pharmacy stubs if needed) ──────────
function PlaceholderPage({ title, icon, description, color }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: color }}>
        <Icon name={icon} size={28} />
      </div>
      <h1 className="text-2xl font-bold text-navy">{title}</h1>
      <p className="text-muted text-sm max-w-xs">{description}</p>
    </div>
  );
}

export function FilingRoomPage() {
  return <PlaceholderPage title="Filing Room" icon="package" description="Pull patient files and manage fast-track entries." color="#1A365D" />;
}

export function PharmacyPage() {
  return <PlaceholderPage title="Pharmacy Kanban" icon="package" description="Pack incoming files and confirm patient collections." color="#00B4D8" />;
}

// ─── Shared API helper ────────────────────────────────────────────────────────
const BASE = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/api(\/v1)?$/, "");

async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem("fre_token");
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy text-sm">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-navy text-lg leading-none cursor-pointer bg-transparent border-0">✕</button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="mb-3"><label className="label">{label}</label>{children}</div>;
}

function Input({ value, onChange, type = "text", placeholder, required }) {
  return <input type={type} className="input" value={value} onChange={onChange} placeholder={placeholder} required={required} />;
}

function Sel({ value, onChange, children, required }) {
  return <select className="input" value={value} onChange={onChange} required={required}>{children}</select>;
}

function SubmitBtn({ loading, label }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? "Saving…" : label}
    </button>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:   "bg-yellow-50 text-yellow-700 border border-yellow-200",
  confirmed: "bg-sky/10 text-sky border border-sky/30",
  pulled:    "bg-navy/10 text-navy border border-navy/30",
  ready:     "bg-green/10 text-green border border-green/40",
  collected: "bg-green/20 text-green border border-green/50",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
  dispensed: "bg-gray-100 text-gray-500 border border-gray-200",
  active:    "bg-green/10 text-green border border-green/40",
  inactive:  "bg-gray-100 text-gray-500 border border-gray-200",
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-600";
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{status}</span>;
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
const TABS = ["Patients", "Appointments", "Clinics"];

function TabBar({ active, setActive }) {
  return (
    <div className="flex border-b border-border mb-5">
      {TABS.map((t) => (
        <button key={t} onClick={() => setActive(t)}
          className={`px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer bg-transparent border-0 ${active === t ? "nav-link-active border-b-2 border-sky" : "nav-link-inactive"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────
function StatsStrip({ stats }) {
  const items = [
    { label: "Patients",     value: stats.total_patients,     color: "text-navy"  },
    { label: "Appointments", value: stats.total_appointments, color: "text-sky"   },
    { label: "Today",        value: stats.today_appointments, color: "text-amber" },
    { label: "Confirmed",    value: stats.confirmed,          color: "text-green" },
    { label: "Collected",    value: stats.collected,          color: "text-navy"  },
    { label: "Pending",      value: stats.pending,            color: "text-amber" },
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
      {items.map(({ label, value, color }) => (
        <div key={label} className="stat-card">
          <div className="stat-label">{label}</div>
          <div className={`stat-value ${color}`}>{value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════════════════════════════════════════════
function PatientsPanel({ clinics }) {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState("");
  const [appointmentPatient, setAppointmentPatient] = useState(null);
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000);

  {
  appointmentPatient && (
    <BookAppointmentModal
      patient={appointmentPatient}
      onClose={() => setAppointmentPatient(null)}
      onSaved={() => {
        setAppointmentPatient(null);
        notify("Appointment booked successfully.");
      }}
    />
  );
}}

function BookAppointmentModal({ patient, onClose, onSaved }) {
  const [collectionDate, setCollectionDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      await apiFetch("/admin/appointments", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patient.patient_id,
          collection_date: collectionDate,
          time_slot: timeSlot
        })
      });

      onSaved();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Book Appointment" onClose={onClose}>
      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <p className="mb-4 text-sm">
          Patient:
          <strong>
            {" "}
            {patient.first_name} {patient.last_name}
          </strong>
        </p>

        <Field label="Collection Date">
          <Input
            type="date"
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            required
          />
        </Field>

        <Field label="Time Slot">
          <Sel
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            required
          >
            <option value="">Select Slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </Sel>
        </Field>

        <SubmitBtn
          loading={saving}
          label="Create Appointment"
        />
      </form>
    </Modal>
  );
}

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const d = await apiFetch("/admin/patients?limit=200"); setPatients(d.patients); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient "${name}"? This cannot be undone.`)) return;
    try { await apiFetch(`/admin/patients/${id}`, { method: "DELETE" }); notify(`"${name}" deleted.`); load(); }
    catch (e) { notify(`Error: ${e.message}`); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-navy">Patients ({patients.length})</h2>
        <button onClick={() => setModal("create")} className="btn-sky btn-sm"><Icon name="add" size={13} /> New Patient</button>
      </div>
      {loading && <p className="text-muted text-sm">Loading…</p>}
      {error   && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-canvas border-b border-border">
                {["ID","Name","National ID","Phone","Status","DOB","Actions"].map(h => <th key={h} className="th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && <tr><td colSpan={7} className="td text-center text-muted py-8">No patients found.</td></tr>}
              {patients.map((p) => (
                <tr key={p.patient_id} className="tr">
                  <td className="td text-muted font-mono text-xs">{p.patient_id}</td>
                  <td className="td-strong">{p.first_name} {p.last_name}</td>
                  <td className="td font-mono text-xs">{p.national_id}</td>
                  <td className="td text-xs">{p.phone_number || "—"}</td>
                  <td className="td"><StatusBadge status={p.tracking_status} /></td>
                  <td className="td text-xs text-muted">{p.date_of_birth || "—"}</td>
                  <td className="td">
                    <div className="flex gap-2">
  <button
    onClick={() => setModal(p)}
    className="text-sky hover:underline text-xs cursor-pointer bg-transparent border-0 p-0"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(p.patient_id, `${p.first_name} ${p.last_name}`)}
    className="text-red-500 hover:underline text-xs cursor-pointer bg-transparent border-0 p-0"
  >
    Delete
  </button>

  <button
  onClick={() => {
    console.log("BOOK BUTTON CLICKED");
    setAppointmentPatient(p);
  }}
  className="text-green-600 hover:underline text-xs"
>
  Book Appointment
</button>
{appointmentPatient && (
  <div style={{ background: "yellow", padding: "10px" }}>
    Appointment Modal Should Be Visible
  </div>
)}
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <PatientModal patient={modal === "create" ? null : modal} clinics={clinics} onClose={() => setModal(null)} onSaved={() => { setModal(null); notify("Patient saved."); load(); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function PatientModal({ patient, clinics, onClose, onSaved }) {
  const isEdit = !!patient;
  const [form, setForm] = useState({
    clinic_id: patient?.clinic_id ?? (clinics[0]?.clinic_id ?? ""),
    national_id: patient?.national_id ?? "",
    facility_patient_number: patient?.facility_patient_number ?? "",
    first_name: patient?.first_name ?? "",
    last_name: patient?.last_name ?? "",
    phone_number: patient?.phone_number ?? "",
    date_of_birth: patient?.date_of_birth ?? "",
    gender: patient?.gender ?? "",
    tracking_status: patient?.tracking_status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const body = { ...form, clinic_id: Number(form.clinic_id) };
      if (isEdit) await apiFetch(`/admin/patients/${patient.patient_id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/admin/patients", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? "Edit Patient" : "New Patient"} onClose={onClose}>
      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="First Name"><Input value={form.first_name} onChange={set("first_name")} required /></Field>
          <Field label="Last Name"><Input value={form.last_name} onChange={set("last_name")} required /></Field>
          <Field label="National ID"><Input value={form.national_id} onChange={set("national_id")} placeholder="8204155009087" required /></Field>
          <Field label="Facility Patient #"><Input value={form.facility_patient_number} onChange={set("facility_patient_number")} placeholder="FRE-00001" required /></Field>
          <Field label="Phone"><Input value={form.phone_number} onChange={set("phone_number")} placeholder="+27821234567" /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.date_of_birth} onChange={set("date_of_birth")} /></Field>
          <Field label="Gender">
            <Sel value={form.gender} onChange={set("gender")}>
              <option value="">— Select —</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </Sel>
          </Field>
          <Field label="Tracking Status">
            <Sel value={form.tracking_status} onChange={set("tracking_status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </Sel>
          </Field>
          <Field label="Clinic">
            <Sel value={form.clinic_id} onChange={set("clinic_id")} required>
              {clinics.map((c) => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
            </Sel>
          </Field>
        </div>
        <SubmitBtn loading={saving} label={isEdit ? "Save Changes" : "Create Patient"} />
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════════
const STATUSES = ["pending","confirmed","pulled","ready","collected","cancelled","dispensed","completed"];
const TIME_SLOTS = ["07:00-08:00","08:00-09:00","08:30-09:30","09:00-10:00","10:00-11:00","10:30-11:30","11:00-12:00","12:00-13:00","13:00-14:00","14:00-15:00"];

function AppointmentsPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [modal,   setModal]   = useState(null);
  const [filter,  setFilter]  = useState("");
  const [toast,   setToast]   = useState("");
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const qs = filter ? `?status_filter=${filter}&limit=200` : "?limit=200";
      const d = await apiFetch(`/admin/appointments${qs}`);
      setAppointments(d.appointments);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete appointment #${id}?`)) return;
    try { await apiFetch(`/admin/appointments/${id}`, { method: "DELETE" }); notify(`Appointment #${id} deleted.`); load(); }
    catch (e) { notify(`Error: ${e.message}`); }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-sm font-bold text-navy">Appointments ({appointments.length})</h2>
        <div className="flex gap-2 items-center">
          <select className="input py-1 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setModal("create")} className="btn-sky btn-sm"><Icon name="add" size={13} /> New Appointment</button>
        </div>
      </div>
      {loading && <p className="text-muted text-sm">Loading…</p>}
      {error   && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-canvas border-b border-border">
                {["ID","Patient ID","Date","Slot","Status","Express Code","Actions"].map(h => <th key={h} className="th">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && <tr><td colSpan={7} className="td text-center text-muted py-8">No appointments found.</td></tr>}
              {appointments.map((a) => (
                <tr key={a.appointment_id} className="tr">
                  <td className="td text-muted font-mono text-xs">{a.appointment_id}</td>
                  <td className="td text-xs">{a.patient_id}</td>
                  <td className="td text-xs font-medium">{a.collection_date}</td>
                  <td className="td text-xs">{a.time_slot}</td>
                  <td className="td"><StatusBadge status={a.status} /></td>
                  <td className="td"><span className="ref-chip">{a.express_code || "—"}</span></td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(a)} className="text-sky hover:underline text-xs cursor-pointer bg-transparent border-0 p-0">Edit</button>
                      <button onClick={() => handleDelete(a.appointment_id)} className="text-red-500 hover:underline text-xs cursor-pointer bg-transparent border-0 p-0">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <AppointmentModal appointment={modal === "create" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); notify("Appointment saved."); load(); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function AppointmentModal({ appointment, onClose, onSaved }) {
  const isEdit = !!appointment;
  const [form, setForm] = useState({
    patient_id:      appointment?.patient_id      ?? "",
    collection_date: appointment?.collection_date ?? "",
    time_slot:       appointment?.time_slot       ?? "",
    phone_number:    appointment?.phone_number    ?? "",
    status:          appointment?.status          ?? "pending",
    express_code:    appointment?.express_code    ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const body = { ...form, patient_id: Number(form.patient_id) };
      if (!body.express_code) delete body.express_code;
      if (!body.phone_number) delete body.phone_number;
      if (isEdit) await apiFetch(`/admin/appointments/${appointment.appointment_id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await apiFetch("/admin/appointments", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? `Edit Appointment #${appointment.appointment_id}` : "New Appointment"} onClose={onClose}>
      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
      <form onSubmit={handleSubmit}>
        <Field label="Patient ID"><Input value={form.patient_id} onChange={set("patient_id")} placeholder="e.g. 1" required /></Field>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Collection Date"><Input type="date" value={form.collection_date} onChange={set("collection_date")} required /></Field>
          <Field label="Time Slot">
            <Sel value={form.time_slot} onChange={set("time_slot")} required>
              <option value="">— Select —</option>
              {TIME_SLOTS.map((s) => <option key={s}>{s}</option>)}
            </Sel>
          </Field>
          <Field label="Status">
            <Sel value={form.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Sel>
          </Field>
          <Field label="Phone Number"><Input value={form.phone_number} onChange={set("phone_number")} placeholder="+27821234567" /></Field>
          {isEdit && <Field label="Express Code"><Input value={form.express_code} onChange={set("express_code")} placeholder="INS-XXXX" /></Field>}
        </div>
        <SubmitBtn loading={saving} label={isEdit ? "Save Changes" : "Create Appointment"} />
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICS
// ═══════════════════════════════════════════════════════════════════════════════
function ClinicsPanel({ clinics, reload }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete clinic "${name}"?`)) return;
    try { await apiFetch(`/admin/clinics/${id}`, { method: "DELETE" }); notify(`"${name}" deleted.`); reload(); }
    catch (e) { notify(`Error: ${e.message}`); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-navy">Clinics ({clinics.length})</h2>
        <button onClick={() => setModal("create")} className="btn-sky btn-sm"><Icon name="add" size={13} /> New Clinic</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {clinics.length === 0 && <p className="text-muted text-sm col-span-2">No clinics found.</p>}
        {clinics.map((c) => (
          <div key={c.clinic_id} className="panel p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-navy text-sm">{c.clinic_name}</p>
                <p className="text-xs text-muted font-mono">{c.facility_code}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setModal(c)} className="text-sky hover:underline text-xs cursor-pointer bg-transparent border-0 p-0">Edit</button>
                <button onClick={() => handleDelete(c.clinic_id, c.clinic_name)} className="text-red-500 hover:underline text-xs cursor-pointer bg-transparent border-0 p-0">Delete</button>
              </div>
            </div>
            <p className="text-xs text-muted">{c.location}</p>
            <p className="text-xs text-muted">{c.province}</p>
          </div>
        ))}
      </div>
      {modal && <ClinicModal clinic={modal === "create" ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); notify("Clinic saved."); reload(); }} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function ClinicModal({ clinic, onClose, onSaved }) {
  const isEdit = !!clinic;
  const [form, setForm] = useState({
    clinic_name:   clinic?.clinic_name   ?? "",
    facility_code: clinic?.facility_code ?? "",
    location:      clinic?.location      ?? "",
    province:      clinic?.province      ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (isEdit) await apiFetch(`/admin/clinics/${clinic.clinic_id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await apiFetch("/admin/clinics", { method: "POST", body: JSON.stringify(form) });
      onSaved();
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isEdit ? "Edit Clinic" : "New Clinic"} onClose={onClose}>
      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
      <form onSubmit={handleSubmit}>
        <Field label="Clinic Name"><Input value={form.clinic_name} onChange={set("clinic_name")} placeholder="Tshwane Clinic 1" required /></Field>
        <Field label="Facility Code"><Input value={form.facility_code} onChange={set("facility_code")} placeholder="TSH-001" required /></Field>
        <Field label="Location"><Input value={form.location} onChange={set("location")} placeholder="Pretoria CBD, Gauteng" required /></Field>
        <Field label="Province"><Input value={form.province} onChange={set("province")} placeholder="Gauteng" required /></Field>
        <SubmitBtn loading={saving} label={isEdit ? "Save Changes" : "Create Clinic"} />
      </form>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PAGE (exported — used by App.jsx via PlaceholderPages)
// ═══════════════════════════════════════════════════════════════════════════════
export function AdminPage() {
  const [tab,     setTab]     = useState("Patients");
  const [stats,   setStats]   = useState({});
  const [clinics, setClinics] = useState([]);

  const loadClinics = useCallback(async () => {
    try { const d = await apiFetch("/admin/clinics"); setClinics(d.clinics); } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    try { const d = await apiFetch("/admin/stats"); setStats(d); } catch {}
  }, []);

  useEffect(() => { loadStats(); loadClinics(); }, [loadStats, loadClinics]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-navy leading-tight">Admin Command Centre</h1>
          <p className="text-muted text-sm mt-0.5">Manage patients, appointments, and clinics.</p>
        </div>
        <button onClick={() => { loadStats(); loadClinics(); }} className="btn-sky btn-sm">
          <Icon name="refresh" size={13} /> Refresh
        </button>
      </div>
      <StatsStrip stats={stats} />
      <div className="panel">
        <TabBar active={tab} setActive={setTab} />
        {tab === "Patients"     && <PatientsPanel clinics={clinics} />}
        {tab === "Appointments" && <AppointmentsPanel />}
        {tab === "Clinics"      && <ClinicsPanel clinics={clinics} reload={loadClinics} />}
      </div>
    </div>
  );
}