import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../context/AppContext';
import { apiRequest } from '../api'; // Your API client layer

export const useDataFetch = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useAppDispatch();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    dispatch({ type: 'SET_SYNC_STATUS', payload: 'SYNCING' });

    try {
      const response = await apiRequest(endpoint);
      setData(response.data);
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'IDLE' });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'ERROR' });

      // Intercept Token Expired / Unauthorized states immediately
      if (err.status === 401 || err.status === 403) {
        console.warn("Session invalidated. Enforcing logout routines.");
        dispatch({ type: 'LOGOUT' });
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};