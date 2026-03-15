import { useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { ToastState } from "./types";

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

// Auto-dismissing toast notification
const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-mono ${
        toast.type === "success"
          ? "bg-[var(--brand-card)] border-[var(--brand-primary)]/30 text-[var(--brand-primary)]"
          : "bg-[var(--brand-card)] border-red-500/30 text-red-400"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <AlertCircle size={16} />
      )}
      {toast.message}
    </div>
  );
};

export default Toast;
