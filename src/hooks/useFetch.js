import { useState, useEffect, useCallback } from "react";

/**
 * useFetch — generic data-fetching hook.
 *
 * @param {Function} fetchFn  — async function that returns data (e.g. getFilingSlots)
 * @param {Array}    deps     — extra dependencies that should re-trigger the fetch
 *
 * Returns: { data, loading, error, refetch }
 */
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, ...deps]);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
