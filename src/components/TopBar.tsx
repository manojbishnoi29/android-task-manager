"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { CheckSquare, Smartphone, Laptop, User, ShieldCheck } from "lucide-react";

interface TopBarProps {
  onOpenAuth: () => void;
  onOpenNewTask: () => void;
}

export function TopBar({ onOpenAuth, onOpenNewTask }: TopBarProps) {
  const { user, deviceViewMode, setDeviceViewMode } = useTheme();

  return (
    <header className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 py-2.5 flex items-center justify-between z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
          <CheckSquare className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            Android Tasks
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
              Simple
            </span>
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle between Phone Frame and Fluid Dashboard */}
        <button
          onClick={() => setDeviceViewMode(deviceViewMode === "phone" ? "fluid" : "phone")}
          title="Toggle Android Device Frame Preview"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold transition-colors"
        >
          {deviceViewMode === "phone" ? (
            <>
              <Laptop className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Wide View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Phone Frame</span>
            </>
          )}
        </button>

        {/* User profile / Login button */}
        {user ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <img
              src={
                user.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || "alex"}`
              }
              alt={user.name}
              className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 hidden sm:inline truncate max-w-[100px]">
              {user.name.split(" ")[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
