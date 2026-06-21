import React, { useState, useCallback } from "react";
import Icon from "../components/common/Icon";
import { LoadingState, ErrorState } from "../components/common/FetchState";
import { useFetch } from "../hooks/useFetch";
import { getIncomingCards, getReadyCards, markCardPacked, markCardCollected } from "../api/pharmacy";

// ── Card ──────────────────────────────────────────────────────────────────────
function PatientCard({ card, action, busy }) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 flex flex-col gap-3">

      {/* Name + code row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-navy leading-tight">{card.name}</span>
        <span className="ref-chip shrink-0">{card.code}</span>
      </div>

      {/* Slot time */}
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Icon name="package" size={12} />
        <span>Pickup slot — <strong className="text-gray-700">{card.slot}</strong></span>
      </div>

      {/* Action button */}
      <div className="pt-1 border-t border-border">
        {action.type === "pack" ? (
          <button
            onClick={() => action.handler(card.id, card.name)}
            disabled={busy}
            className="w-full btn-sky btn-sm justify-center py-1.5 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name="check" size={13} />
            {busy ? "Updating…" : "Mark Packed — Ready"}
          </button>
        ) : (
          <button
            onClick={() => action.handler(card.id, card.name)}
            disabled={busy}
            className="w-full btn-green btn-sm justify-center py-1.5 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Icon name="check" size={13} />
            {busy ? "Updating…" : "Confirm Collected"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function KanbanColumn({ title, subtitle, count, countColor, cards, action, emptyMsg, busyId }) {
  return (
    <div className="flex flex-col bg-canvas border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-border flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-navy">{title}</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${countColor}`}>
              {count}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3 p-3 min-h-[300px]">
        {cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-2">
            <Icon name="check" size={28} className="text-emerald-300" />
            <p className="text-sm text-muted">{emptyMsg}</p>
          </div>
        ) : (
          cards.map((card) => (
            <PatientCard key={card.id} card={card} action={action} busy={busyId === card.id} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Summary strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ incoming, ready, collected }) {
  const items = [
    { label: "To Pack",          value: incoming,  color: "text-sky"   },
    { label: "Ready for Pickup", value: ready,     color: "text-green" },
    { label: "Collected Today",  value: collected, color: "text-navy"  },
  ];
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {items.map(({ label, value, color }) => (
        <div key={label} className="stat-card">
          <div className="stat-label">{label}</div>
          <div className={`stat-value ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function PharmacyPage() {
  const fetchIncoming = useCallback(() => getIncomingCards(), []);
  const fetchReady    = useCallback(() => getReadyCards(),    []);

  const { data: incomingData, loading: loadingA, error: errorA, refetch: refetchA } = useFetch(fetchIncoming);
  const { data: readyData,    loading: loadingB, error: errorB, refetch: refetchB } = useFetch(fetchReady);

  const [incoming,  setIncoming]  = useState(null);
  const [ready,     setReady]     = useState(null);
  const [collected, setCollected] = useState(0);
  const [toast,     setToast]     = useState("");
  const [busyId,    setBusyId]    = useState(null);

  // Sync network data into local state
  React.useEffect(() => { if (incomingData) setIncoming(incomingData); }, [incomingData]);
  React.useEffect(() => { if (readyData)    setReady(readyData);       }, [readyData]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handlePacked = async (id, name) => {
    setBusyId(id);
    const card = incoming.find((c) => c.id === id);

    // Optimistic update
    setIncoming((prev) => prev.filter((c) => c.id !== id));
    setReady((prev) => [{ ...card }, ...prev]);

    try {
      await markCardPacked(id);
      notify(`${name}'s pack is ready for pickup`);
    } catch {
      // Roll back
      setIncoming((prev) => [...prev, card]);
      setReady((prev) => prev.filter((c) => c.id !== id));
      notify("Update failed — please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCollected = async (id, name) => {
    setBusyId(id);
    const card = ready.find((c) => c.id === id);

    // Optimistic update
    setReady((prev) => prev.filter((c) => c.id !== id));
    setCollected((n) => n + 1);

    try {
      await markCardCollected(id);
      notify(`${name} has collected their medication`);
    } catch {
      // Roll back
      setReady((prev) => [...prev, card]);
      setCollected((n) => n - 1);
      notify("Update failed — please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const loading = loadingA || loadingB;
  const error   = errorA || errorB;
  const refetch = () => { refetchA(); refetchB(); };

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Page heading ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold text-navy leading-tight">Pharmacy Kanban</h1>
          <p className="text-muted text-sm mt-0.5">
            Pack incoming files and confirm patient collections.
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-navy px-3 py-1.5 rounded-lg whitespace-nowrap">
          {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </div>

      {/* ── Loading state ── */}
      {loading && <LoadingState message="Fetching pharmacy queue…" />}

      {/* ── Error state ── */}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {/* ── Data loaded ── */}
      {!loading && !error && incoming && ready && (
        <>
          <SummaryStrip
            incoming={incoming.length}
            ready={ready.length}
            collected={collected}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KanbanColumn
              title="Incoming Files"
              subtitle="To Pack"
              count={incoming.length}
              countColor="bg-sky"
              cards={incoming}
              action={{ type: "pack", handler: handlePacked }}
              emptyMsg="All incoming files have been packed"
              busyId={busyId}
            />
            <KanbanColumn
              title="Ready for Pickup"
              subtitle="Today"
              count={ready.length}
              countColor="bg-green"
              cards={ready}
              action={{ type: "collect", handler: handleCollected }}
              emptyMsg="No patients ready for pickup yet"
              busyId={busyId}
            />
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
