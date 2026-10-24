"use client";

import React from "react";
import { AndroidStatusBar } from "./AndroidStatusBar";
import { useTheme } from "./ThemeContext";
import { Smartphone, Laptop, Sparkles } from "lucide-react";

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
}

export function AndroidPhoneFrame({ children }: AndroidPhoneFrameProps) {
  const { deviceViewMode, setDeviceViewMode } = useTheme();

  // If fluid desktop dashboard mode is chosen, render children normally with responsive layout
  if (deviceViewMode === "fluid") {
    return <div className="w-full h-full min-h-screen flex flex-col">{children}</div>;
  }

  // Otherwise, render simulated Android smartphone frame
  return (
    <div className="min-h-screen bg-neutral-900/90 dark:bg-black/95 flex flex-col items-center justify-center p-2 sm:p-6 overflow-x-hidden">
      {/* Top Banner Control: Switch to full desktop or phone view */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm px-2 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium text-neutral-300">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Android 14 Device Preview</span>
        </div>
        <button
          onClick={() => setDeviceViewMode("fluid")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Exit to Dashboard</span>
        </button>
      </div>

      {/* Simulated Android Phone Shell */}
      <div className="relative w-full max-w-[410px] h-[844px] max-h-[92vh] bg-neutral-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-white/15 border-[5px] border-neutral-800 flex flex-col overflow-hidden">
        {/* Right side power & volume buttons visual simulator */}
        <div className="absolute -right-[7px] top-28 w-[3px] h-10 bg-neutral-700 rounded-r-sm"></div>
        <div className="absolute -right-[7px] top-44 w-[3px] h-16 bg-neutral-700 rounded-r-sm"></div>

        {/* Screen container */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-neutral-900 rounded-[38px] flex flex-col overflow-hidden shadow-inner">
          {/* Android Status Bar */}
          <AndroidStatusBar />

          {/* App Viewport inside Phone */}
          <div className="flex-1 flex flex-col overflow-y-auto relative no-scrollbar">
            {children}
          </div>

          {/* Android Bottom Navigation Gesture Bar Indicator */}
          <div className="w-full py-1.5 flex items-center justify-center bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm z-30 select-none">
            <div className="w-32 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
