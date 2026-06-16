import React, { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: "5rem", right: "1.5rem",
      background: "#1A365D", color: "#fff",
      padding: "10px 18px", borderRadius: 8,
      fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: 999, animation: "fadeIn 0.2s ease",
    }}>
      {message}
    </div>
  );
}
