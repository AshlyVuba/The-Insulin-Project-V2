import React from "react";
import Icon from "./Icon";

export function LoadingState({ message = "Loading data…" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted">
      <svg
        className="animate-spin text-sky"
        width={32} height={32} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-6">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <Icon name="refresh" size={22} className="text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Couldn't load data</p>
        <p className="text-xs text-muted max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <Icon name="refresh" size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
