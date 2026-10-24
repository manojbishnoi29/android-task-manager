"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { triggerHaptic } from "@/lib/sound";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const { hapticEnabled, accentClasses } = useTheme();

  return (
    <button
      onClick={() => {
        triggerHaptic(hapticEnabled);
        onClick();
      }}
      aria-label="Add new task"
      className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/35 transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
    >
      <Plus className="w-7 h-7 stroke-[2.8] transition-transform duration-200 group-hover:rotate-90" />
    </button>
  );
}
