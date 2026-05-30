"use client";
import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Teruskan",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? "bg-red-50" : "bg-yellow-50"}`}>
          {danger
            ? <Trash2 className="w-6 h-6 text-red-500" />
            : <AlertTriangle className="w-6 h-6 text-yellow-500" />}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition ${
              danger
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "gradient-primary text-white hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
