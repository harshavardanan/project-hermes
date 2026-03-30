import React, { useEffect, useCallback } from "react";
import type { PropsWithChildren } from "react";

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Overlay modal for image previews, confirmations, and dialogs.
 *
 * @example
 * ```tsx
 * <Modal open={showPreview} onClose={() => setShowPreview(false)}>
 *   <img src="..." alt="preview" />
 * </Modal>
 * ```
 */
export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  open,
  onClose,
  className = "",
  children,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={`hermes-modal-overlay ${className}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation: "hermes-fade-in 0.15s ease",
      }}
    >
      <div
        className="hermes-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 16px 64px rgba(0,0,0,0.3)",
          animation: "hermes-pop 0.2s ease",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          ✕
        </button>
        {children}
      </div>
      <style>{`
        @keyframes hermes-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hermes-pop {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
