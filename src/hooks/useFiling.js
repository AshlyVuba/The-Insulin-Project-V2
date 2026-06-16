import { useState, useEffect, useCallback } from "react";
import { filingApi } from "../api/filingApi";

export function useFiling() {
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filingApi.getFiles();
      setFiles(data);
    } catch (err) {
      setError("Failed to load files. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const markPulled = useCallback(async (id) => {
    await filingApi.markPulled(id);
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, pulled: true } : f));
  }, []);

  const sendReminder = useCallback(async (id) => {
    await filingApi.sendReminder(id);
  }, []);

  const createFastTrackEntry = useCallback(async (entry) => {
    const created = await filingApi.createFastTrackEntry(entry);
    setFiles((prev) => [created, ...prev]);
    return created;
  }, []);

  return { files, loading, error, markPulled, sendReminder, createFastTrackEntry, refresh: fetchFiles };
}

