"use client";

import React from "react";
import { ViewTab, Category, UserProfile } from "@/lib/types";
import { useTheme } from "./ThemeContext";
import {
  CheckSquare,
  Calendar,
  Star,
  ListTodo,
  FolderTree,
  BarChart3,
  Settings,
  Plus,
  Smartphone,
  Laptop,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categories: Category[];
  totalTasksCount: number;
  todayTasksCount: number;
  starredTasksCount: number;
  onOpenNewTask: () => void;
  onOpenNewCategory: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  selectedCategory,
  onSelectCategory,
  categories,
  totalTasksCount,
  todayTasksCount,
  starredTasksCount,
  onOpenNewTask,
  onOpenNewCategory,
  onOpenAuth,
  onLogout,
}: SidebarProps) {
  const { user, deviceViewMode, setDeviceViewMode, accentClasses } = useTheme();

  const navItems = [
    {
      id: "all" as ViewTab,
      label: "All Tasks",
      icon: ListTodo,
      badge: totalTasksCount,
    },
    {
      id: "today" as ViewTab,
      label: "Today",
      icon: Calendar,
      badge: todayTasksCount,
    },
    {
      id: "starred" as ViewTab,
      label: "Important",
      icon: Star,
      badge: starredTasksCount,
    },
    {
      id: "calendar" as ViewTab,
      label: "Schedule",
      icon: Calendar,
    },
    {
      id: "categories" as ViewTab,
      label: "Categories",
      icon: FolderTree,
      badge: categories.length,
    },
    {
      id: "stats" as ViewTab,
      label: "Productivity",
      icon: BarChart3,
    },
    {
      id: "settings" as ViewTab,
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 h-full shrink-0 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 select-none">
      {/* Brand header */}
      <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
                Android Tasks
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                Simple
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Easy mobile task manager</p>
          </div>
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenNewTask}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 py-1.5">
          Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id && !selectedCategory;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectCategory(null);
                onSelectTab(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive
                      ? "bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Categories Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Lists & Categories
            </span>
            <button
              onClick={onOpenNewCategory}
              title="Add Category"
              className="text-neutral-400 hover:text-emerald-600 p-0.5 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectTab("all");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {cat.taskCount !== undefined && (
                    <span className="text-[11px] text-neutral-400">{cat.taskCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer: Device Preview Switcher & User Profile */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
        {/* Device view switcher */}
        <div className="bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl flex items-center text-xs font-medium">
          <button
            onClick={() => setDeviceViewMode("phone")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              deviceViewMode === "phone"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone View</span>
          </button>
          <button
            onClick={() => setDeviceViewMode("fluid")}
            className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              deviceViewMode === "fluid"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Sync status badge */}
        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium truncate">Saved locally & Cloud DB</span>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || "alex"}`
                }
                alt={user.name}
                className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </aside>
  );
}
