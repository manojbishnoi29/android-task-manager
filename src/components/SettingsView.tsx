"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { Task } from "@/lib/types";
import {
  saveTasksLocally,
  loadTasksLocally,
  getLocalStorageStats,
  downloadTasksJson,
  clearLocalBackup,
} from "@/lib/storage";
import { playTaskDoneSound, triggerHaptic } from "@/lib/sound";
import {
  Moon,
  Sun,
  Monitor,
  Volume2,
  Vibrate,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  User,
  Check,
  Shield,
  Smartphone,
  Info,
  Sparkles,
} from "lucide-react";

interface SettingsViewProps {
  tasks: Task[];
  onTasksUpdated: () => void;
  onShowSnackbar: (msg: { text: string; type?: "success" | "error" | "info" }) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function SettingsView({
  tasks,
  onTasksUpdated,
  onShowSnackbar,
  onOpenAuth,
  onLogout,
}: SettingsViewProps) {
  const {
    themePreference,
    setThemePreference,
    accent,
    setAccent,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    user,
    setUser,
    deviceViewMode,
    setDeviceViewMode,
  } = useTheme();

  const [storageStats, setStorageStats] = useState({ count: 0, bytes: 0, lastSaved: null as string | null });
  const [isResetting, setIsResetting] = useState(false);
  const [userName, setUserName] = useState(user?.name || "Alex Morgan");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setStorageStats(getLocalStorageStats());
  }, [tasks]);

  useEffect(() => {
    if (user?.name) setUserName(user.name);
  }, [user]);

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    if (val) playTaskDoneSound(true);
    updateRemoteSetting({ soundEnabled: val });
  };

  const handleHapticToggle = (val: boolean) => {
    setHapticEnabled(val);
    if (val) triggerHaptic(true);
    updateRemoteSetting({ hapticEnabled: val });
  };

  const handleThemeChange = (pref: "system" | "light" | "dark") => {
    setThemePreference(pref);
    updateRemoteSetting({ theme: pref });
  };

  const handleAccentChange = (col: "emerald" | "blue" | "purple" | "amber" | "rose") => {
    setAccent(col);
    updateRemoteSetting({ accentColor: col });
  };

  const updateRemoteSetting = async (settings: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch {
      // Ignored for offline mode
    }
  };

  const handleSaveLocalManual = () => {
    saveTasksLocally(tasks);
    setStorageStats(getLocalStorageStats());
    onShowSnackbar({ text: `Saved ${tasks.length} tasks to Local Storage!`, type: "success" });
  };

  const handleDownloadBackup = () => {
    downloadTasksJson(tasks, user?.name || "alex");
    onShowSnackbar({ text: "Downloaded tasks backup JSON file!", type: "success" });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedTasks: Task[] = Array.isArray(parsed) ? parsed : parsed.tasks;

      if (!Array.isArray(importedTasks)) {
        throw new Error("Invalid backup JSON format");
      }

      // Save each imported task to server
      for (const t of importedTasks) {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: t.title,
            description: t.description,
            priority: t.priority || "medium",
            dueDate: t.dueDate,
            dueTime: t.dueTime,
            isStarred: t.isStarred,
            subtasks: t.subtasks?.map((s) => s.title) || [],
          }),
        });
      }

      onTasksUpdated();
      onShowSnackbar({ text: `Successfully restored ${importedTasks.length} tasks!`, type: "success" });
    } catch (err) {
      console.error(err);
      onShowSnackbar({ text: "Failed to parse backup file. Please use a valid JSON file.", type: "error" });
    } finally {
      e.target.value = "";
    }
  };

  const handleClearLocal = () => {
    clearLocalBackup();
    setStorageStats(getLocalStorageStats());
    onShowSnackbar({ text: "Local storage cache cleared.", type: "info" });
  };

  const handleResetDemoData = async () => {
    if (!confirm("Reset all tasks to the beginner realistic starter set? Any custom tasks will be refreshed.")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (res.ok) {
        onTasksUpdated();
        onShowSnackbar({ text: "Reset to beginner demo tasks successfully! 🎉", type: "success" });
      } else {
        onShowSnackbar({ text: "Failed to reset demo data.", type: "error" });
      }
    } catch {
      onShowSnackbar({ text: "Network error resetting demo data.", type: "error" });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsSavingProfile(true);
    try {
      await updateRemoteSetting({ name: userName.trim() });
      onShowSnackbar({ text: "Profile name updated!", type: "success" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const accents: { id: "emerald" | "blue" | "purple" | "amber" | "rose"; label: string; color: string }[] = [
    { id: "emerald", label: "Android Green", color: "#10b981" },
    { id: "blue", label: "Material Blue", color: "#3b82f6" },
    { id: "purple", label: "Lavender", color: "#8b5cf6" },
    { id: "amber", label: "Sunset", color: "#f59e0b" },
    { id: "rose", label: "Coral", color: "#f43f5e" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize your Android task manager experience & local storage
        </p>
      </div>

      {/* 1. Theme & Appearance */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </div>

        {/* Theme mode buttons */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light" as const, label: "Light", icon: Sun },
              { id: "dark" as const, label: "Dark", icon: Moon },
              { id: "system" as const, label: "System", icon: Monitor },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = themePreference === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleThemeChange(m.id)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Color Palette */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Material Accent Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {accents.map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleAccentChange(acc.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  accent === acc.id
                    ? "ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-neutral-900 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                <span>{acc.label}</span>
                {accent === acc.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sounds & Haptic Feedback */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Volume2 className="w-4 h-4 text-emerald-500" />
          <span>Sounds & Haptic Feedback</span>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Task Completion Chime
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Play a pleasant mobile chime when a task is completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => playTaskDoneSound(true)}
              className="text-[11px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
            >
              Test
            </button>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => handleSoundToggle(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Haptic toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Vibrate className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Haptic Vibration
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Subtle tactile buzz on Android phones when tapping actions
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={hapticEnabled}
            onChange={(e) => handleHapticToggle(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Local Storage & Offline Backup ("save task locally") */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>Save Tasks Locally & Backup</span>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Active
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Your tasks are automatically stored in the PostgreSQL database and mirrored in your browser&apos;s
          Local Storage for fast offline caching and instant loading.
        </p>

        {/* Diagnostic card */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Local Storage Backup:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {storageStats.count} tasks cached ({Math.round(storageStats.bytes / 1024)} KB)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Database Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Connected & Synced
            </span>
          </div>
          {storageStats.lastSaved && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Last Local Sync:</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {new Date(storageStats.lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          )}
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleSaveLocalManual}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span>Force Save to Local Cache</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Tasks (JSON)</span>
          </button>

          <label className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-purple-500" />
            <span>Import Tasks (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleClearLocal}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-2"
          >
            <span>Clear Local Storage Cache</span>
          </button>
        </div>
      </div>

      {/* 4. Beginner Realistic Demo Data Reset */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Realistic Demo Tasks</span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Want a fresh, realistic beginner task list? Resetting reloads realistic daily tasks: Groceries,
          Duolingo practice, calling family, work sprint slides, and watering plants.
        </p>
        <button
          onClick={handleResetDemoData}
          disabled={isResetting}
          className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          <span>{isResetting ? "Resetting Demo..." : "Reset to Beginner Demo Data"}</span>
        </button>
      </div>

      {/* 5. User Profile & Account */}
      <div className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <User className="w-4 h-4 text-emerald-500" />
          <span>Account & Profile</span>
        </div>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || "alex"}`
                }
                alt={user.name}
                className="w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-700"
              />
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{user.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Beginner Android Account
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your Name"
                className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isSavingProfile || !userName.trim()}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90"
              >
                Save
              </button>
            </form>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Sign Out
              </button>
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline"
              >
                Switch Account
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You are currently viewing as a guest.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Sign In / Demo Login
            </button>
          </div>
        )}
      </div>

      {/* About Box */}
      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">
            Simple Android Task Manager v1.0
          </p>
          <p className="mt-0.5">
            Crafted for beginners with Android Material 3 design, local offline backup, sound chimes, and
            PostgreSQL persistence.
          </p>
        </div>
      </div>
    </div>
  );
}
