import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Securely log the error to an internal tracking system or local console
    // In production, avoid exposing raw memory dumps or internal backend strings
    console.error("Critical UI Crash Captured:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorInfo: null });
    window.location.href = '/dashboard'; // Redirect to a safe checkpoint
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong displaying this data.</h2>
          <p>The Insulin Express application encountered an unexpected interface error.</p>
          <button
            onClick={this.handleReset}
            style={{ padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;