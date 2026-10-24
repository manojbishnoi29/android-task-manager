"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Signal, BatteryCharging } from "lucide-react";

export function AndroidStatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-1 text-xs font-medium tracking-tight text-neutral-800 dark:text-neutral-200 select-none z-30">
      {/* Time on left */}
      <span className="font-semibold text-[13px]">{time || "09:41"}</span>

      {/* Front camera punchhole simulator */}
      <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 dark:bg-neutral-950 border border-neutral-700/60 shadow-inner flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-blue-900/60"></div>
      </div>

      {/* Status icons on right */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-[10px] font-bold tracking-wider">5G</span>
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">98%</span>
          <BatteryCharging className="w-4 h-4 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}
