import React from "react";

export interface LoadingIndicatorProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Spinner color */
  color?: string;
  /** Loading text */
  text?: string;
  /** Additional class name */
  className?: string;
}

/**
 * A simple animated loading spinner.
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 32,
  color = "#0084ff",
  text,
  className = "",
}) => (
  <div
    className={`hermes-loading ${className}`}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 16,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(128,128,128,0.15)`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "hermes-spin 0.8s linear infinite",
      }}
    />
    {text && (
      <span style={{ fontSize: 13, opacity: 0.6 }}>{text}</span>
    )}
    <style>{`
      @keyframes hermes-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export interface LoadingErrorIndicatorProps {
  /** The error to display */
  error?: Error | string | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Displays an error state with an optional retry button.
 */
export const LoadingErrorIndicator: React.FC<LoadingErrorIndicatorProps> = ({
  error,
  onRetry,
  className = "",
}) => {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;

  return (
    <div
      className={`hermes-loading-error ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 24,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 28 }}>⚠️</span>
      <span style={{ fontSize: 14, opacity: 0.7 }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4,
            padding: "6px 16px",
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: 8,
            background: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};
