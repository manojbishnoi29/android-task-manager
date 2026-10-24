"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface SnackbarMessage {
  id: string;
  text: string;
  type?: "success" | "error" | "info";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface SnackbarProps {
  message: SnackbarMessage | null;
  onClose: () => void;
}

export function Snackbar({ message, onClose }: SnackbarProps) {
  useEffect(() => {
    if (!message) return;
    const duration = message.duration || 4000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-neutral-900/95 dark:bg-neutral-800/95 text-white shadow-xl backdrop-blur-md border border-neutral-700/50">
        <div className="flex items-center gap-2.5 min-w-0">
          {message.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : message.type === "info" ? (
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium leading-snug truncate">{message.text}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {message.actionLabel && message.onAction && (
            <button
              onClick={() => {
                message.onAction?.();
                onClose();
              }}
              className="text-xs font-semibold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              {message.actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
