import { useState, useEffect, useCallback } from "react";
import { pharmacyApi } from "../api/pharmacyApi";

export function usePharmacy() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pharmacyApi.getOrders();
      setOrders(data);
    } catch (err) {
      setError("Failed to load pharmacy orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const moveOrder = useCallback(async (id, newStatus) => {
    await pharmacyApi.updateStatus(id, newStatus);
    if (newStatus === "collected") {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } else {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    }
  }, []);

  const createOrder = useCallback(async (order) => {
    const created = await pharmacyApi.createOrder(order);
    setOrders((prev) => [created, ...prev]);
    return created;
  }, []);

  const incoming = orders.filter((o) => o.status === "incoming");
  const ready    = orders.filter((o) => o.status === "ready");

  return { incoming, ready, loading, error, moveOrder, createOrder, refresh: fetchOrders };
}
