import React from 'react';
import { useFetchState } from '../hooks/useFetchState';
import { apiRequest } from '../api'; // Your backend API layer

export const PipelineActionButton = ({ pipelineId, onStateUpdated }) => {
  const { execute, isLoading, isError, error } = useFetchState();

  const handlePipelineAdvance = async () => {
    // If the hook is already loading, double-guard against execution
    if (isLoading) return;

    try {
      // Define your actual API mutation function
      const apiCall = () => apiRequest(`/pipeline/${pipelineId}/advance`, { method: 'POST' });

      // Execute through our fetch state machine
      const response = await execute(apiCall);

      if (onStateUpdated) {
        onStateUpdated(response.data);
      }
    } catch (err) {
      // Error logging/handling (handled locally or passed to our global ErrorBoundary)
      console.error("Pipeline transition failed:", err);
    }
  };

  return (
    <div className="pipeline-action-container">
      <button
        onClick={handlePipelineAdvance}
        // CRITICAL: Button is immediately disabled when isLoading is true
        disabled={isLoading}
        className={`btn-green ${isLoading ? 'btn-disabled' : ''}`}
        style={{
          backgroundColor: isLoading ? '#a2e8c4' : '#22c55e', // Dims the green when loading
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 20px',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? (
          <>
            {/* Simple CSS Inline Spinner */}
            <span className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Processing...
          </>
        ) : (
          'Confirm Pipeline State'
        )}
      </button>

      {isError && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          Error: {error}. Please try again.
        </p>
      )}

      {/* Embedded Spinner Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};