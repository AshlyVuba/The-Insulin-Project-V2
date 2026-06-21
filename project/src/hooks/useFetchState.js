import { useState, useCallback } from 'react';

export const useFetchState = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    // 1. Instantly trigger loading state to block immediate clicks
    setStatus('loading');
    setError(null);

    // 2. Create a guaranteed 0.50-second timer promise
    const cooldownDelay = new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // 3. Run the API call and the 500ms timer in parallel.
      // Promise.all waits until BOTH are finished before moving to the 'finally' block.
      const [result] = await Promise.all([asyncFunction(...args), cooldownDelay]);

      setStatus('success');
      return result;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Action failed');
      throw err;
    } finally {
      // The 500ms cooldown ensures the button remains disabled even if the API was instant.
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