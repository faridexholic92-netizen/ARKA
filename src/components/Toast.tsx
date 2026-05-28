"use client";
import { create } from "zustand";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  add: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (msg: string) => useToast.getState().add(msg, "success"),
  error: (msg: string) => useToast.getState().add(msg, "error"),
  warning: (msg: string) => useToast.getState().add(msg, "warning"),
  info: (msg: string) => useToast.getState().add(msg, "info"),
};

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
  error:   <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
  info:    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const borders = {
  success: "border-l-green-500",
  error:   "border-l-red-500",
  warning: "border-l-yellow-500",
  info:    "border-l-blue-500",
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`flex items-start gap-3 bg-white rounded-2xl shadow-lg border-l-4 ${borders[t.type]} px-4 py-3 min-w-[280px] max-w-[340px] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      {icons[t.type]}
      <p className="text-sm text-gray-700 flex-1 leading-snug">{t.message}</p>
      <button onClick={onRemove} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0 mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 lg:bottom-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
}
