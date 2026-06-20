import { useState, useCallback } from 'react';

export const useFetchState = () => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    // 1. Instantly trigger loading state to block double-submits
    setStatus('loading');
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setStatus('success');
      return result;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Action failed');
      throw err; // Re-throw to allow local component catch blocks if needed
    } finally {
      // Optional: Reset back to idle after a brief timeout if you want the button re-enabled on failure
      // For success, you typically transition away or keep it disabled
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    execute,
    reset
  };
};