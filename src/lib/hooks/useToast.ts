/**
 * Toast Hook
 * Simple toast notifications using state management
 */

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "success", duration }),
    error: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "error", duration }),
    info: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "info", duration }),
    warning: (title: string, description?: string, duration?: number) =>
      addToast({ title, description, type: "warning", duration }),
  };

  return {
    toasts,
    toast,
    removeToast,
  };
};
