"use client";

import React from "react";
import { ViewTab } from "@/lib/types";
import { ListTodo, Calendar, FolderTree, BarChart3, Settings } from "lucide-react";

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  todayCount: number;
}

export function BottomNav({ currentTab, onSelectTab, todayCount }: BottomNavProps) {
  const tabs = [
    { id: "all" as ViewTab, label: "Tasks", icon: ListTodo },
    { id: "today" as ViewTab, label: "Today", icon: Calendar, badge: todayCount },
    { id: "categories" as ViewTab, label: "Lists", icon: FolderTree },
    { id: "stats" as ViewTab, label: "Stats", icon: BarChart3 },
    { id: "settings" as ViewTab, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around sm:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            }`}
          >
            {/* Material 3 active pill background */}
            <div
              className={`p-1 rounded-full transition-all ${
                isActive ? "bg-emerald-100 dark:bg-emerald-950/80 px-4" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>

            {/* Badge */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
