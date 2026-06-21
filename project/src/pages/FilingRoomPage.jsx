import React, { useState, useCallback } from "react";
import Icon from "../components/common/Icon";
import { LoadingState, ErrorState } from "../components/common/FetchState";
import { useFetch } from "../hooks/useFetch";
import { getFilingSlots, sendFileToPharmacy } from "../api/filing";

const BADGE = {
  urgent:   "pill-urgent",
  today:    "pill-today",
  upcoming: "pill-upcoming",
};

const BADGE_LABEL = {
  urgent:   "Urgent",
  today:    "Today",
  upcoming: "Upcoming",
};

// ── Summary counts ────────────────────────────────────────────────────────────
function getSummary(slots) {
  const all = slots.flatMap((s) => s.files);
  return {
    total:   all.length,
    pending: all.filter((f) => !f.sent).length,
    sent:    all.filter((f) =>  f.sent).length,
    urgent:  slots.filter((s) => s.badge === "urgent").flatMap((s) => s.files).filter((f) => !f.sent).length,
  };
}

// ── Components ────────────────────────────────────────────────────────────────
function SummaryBar({ summary }) {
  const items = [
    { label: "Files to Pull",    value: summary.pending, color: "text-navy"  },
    { label: "Sent to Pharmacy", value: summary.sent,    color: "text-green" },
    { label: "Urgent Pending",   value: summary.urgent,  color: "text-amber" },
    { label: "Total Scheduled",  value: summary.total,   color: "text-sky"   },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {items.map(({ label, value, color }) => (
        <div key={label} className="stat-card">
          <div className="stat-label">{label}</div>
          <div className={`stat-value ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function FileRow({ file, onSend, sending }) {
  return (
    <tr className="tr">
      <td className="td-strong">{file.patient}</td>
      <td className="td">
        <span className="ref-chip">{file.folder}</span>
      </td>
      <td className="td">
        {file.sent ? (
          <span className="inline-flex items-center gap-1.5 pill-pulled px-3 py-1">
            <Icon name="check" size={11} />
            Sent
          </span>
        ) : (
          <button
            onClick={() => onSend(file.id)}
            disabled={sending === file.id}
            className="btn-green btn-sm bg-green text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name="package" size={13} />
            {sending === file.id ? "Sending…" : "Send to Pharmacy"}
          </button>
        )}
      </td>
    </tr>
  );
}

function SlotPanel({ slot, onSend, sending }) {
  const pending = slot.files.filter((f) => !f.sent).length;
  return (
    <section className="panel mb-4">
      <div className="panel-header">
        <div className="flex items-center gap-3">
          <Icon name="package" size={15} className="text-navy" />
          <span className="text-sm font-semibold text-navy">{slot.label}</span>
          <span className={BADGE[slot.badge]}>{BADGE_LABEL[slot.badge]}</span>
        </div>
        <span className="text-xs text-muted">
          {pending} file{pending !== 1 ? "s" : ""} pending
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-canvas border-b border-border">
              <th className="th w-2/5">Patient Name</th>
              <th className="th w-1/4">Folder Number</th>
              <th className="th w-1/3">Action</th>
            </tr>
          </thead>
          <tbody>
            {slot.files.map((file) => (
              <FileRow key={file.id} file={file} onSend={onSend} sending={sending} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function FilingRoomPage() {
  const fetchFn = useCallback(() => getFilingSlots(), []);
  const { data, loading, error, refetch } = useFetch(fetchFn);

  const [slots,   setSlots]   = useState(null);
  const [toast,   setToast]   = useState("");
  const [sending, setSending] = useState(null); // fileId currently being sent

  // Sync network data into local state so we can optimistically update
  React.useEffect(() => {
    if (data) setSlots(data);
  }, [data]);

  const handleSend = async (fileId) => {
    setSending(fileId);
    let sentName = "";

    // Optimistic update
    setSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        files: slot.files.map((f) => {
          if (f.id === fileId) { sentName = f.patient; return { ...f, sent: true }; }
          return f;
        }),
      }))
    );

    try {
      await sendFileToPharmacy(fileId);
      setToast(`${sentName}'s folder sent to Pharmacy`);
    } catch {
      // Roll back optimistic update on failure
      setSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          files: slot.files.map((f) =>
            f.id === fileId ? { ...f, sent: false } : f
          ),
        }))
      );
      setToast("Failed to send — please try again.");
    } finally {
      setSending(null);
      setTimeout(() => setToast(""), 2800);
    }
  };

  const activeSlots = slots ?? [];
  const summary     = getSummary(activeSlots);

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Page heading ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-navy leading-tight">Filing Room</h1>
          <p className="text-muted text-sm mt-0.5">
            Pull folders and send to Pharmacy before the patient arrives.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-navy px-3 py-1.5 rounded-lg whitespace-nowrap">
          {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      {/* ── Loading state ── */}
      {loading && <LoadingState message="Fetching today's filing slots…" />}

      {/* ── Error state ── */}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {/* ── Data loaded ── */}
      {!loading && !error && slots && (
        <>
          <SummaryBar summary={summary} />
          <div>
            {activeSlots.map((slot) => (
              <SlotPanel key={slot.id} slot={slot} onSend={handleSend} sending={sending} />
            ))}
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
