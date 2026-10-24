"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { Task } from "@/lib/types";
import {
  saveTasksLocally,
  getLocalStorageStats,
  downloadTasksJson,
  clearLocalBackup,
  saveCategoriesLocally,
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
  Smartphone,
  Sparkles,
} from "lucide-react";

interface SettingsViewProps {
  tasks: Task[];
  onTasksUpdated: () => void;
  onShowSnackbar: (
    msg: { text: string; type?: "success" | "error" | "info" }
  ) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const PROFILE_KEY = "android_task_manager_profile";
const SETTINGS_KEY = "android_task_manager_settings";

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
  } = useTheme();

  const [storageStats, setStorageStats] = useState({
    count: 0,
    bytes: 0,
    lastSaved: null as string | null,
  });

  const [isResetting, setIsResetting] = useState(false);
  const [userName, setUserName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setStorageStats(getLocalStorageStats());
  }, [tasks]);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(PROFILE_KEY);
      if (savedName) setUserName(savedName);

      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        if (typeof settings.soundEnabled === "boolean") {
          setSoundEnabled(settings.soundEnabled);
        }

        if (typeof settings.hapticEnabled === "boolean") {
          setHapticEnabled(settings.hapticEnabled);
        }

        if (
          settings.themePreference === "light" ||
          settings.themePreference === "dark" ||
          settings.themePreference === "system"
        ) {
          setThemePreference(settings.themePreference);
        }

        if (
          ["emerald", "blue", "purple", "amber", "rose"].includes(
            settings.accent
          )
        ) {
          setAccent(settings.accent);
        }
      }
    } catch (error) {
      console.error("Could not load local settings:", error);
    }
  }, [setSoundEnabled, setHapticEnabled, setThemePreference, setAccent]);

  const saveSettings = (updates: Record<string, unknown>) => {
    try {
      const current = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || "{}"
      );

      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...current, ...updates })
      );
    } catch (error) {
      console.error("Could not save local settings:", error);
      onShowSnackbar({
        text: "Could not save settings on this device.",
        type: "error",
      });
    }
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSettings({ soundEnabled: value });

    if (value) playTaskDoneSound(true);
  };

  const handleHapticToggle = (value: boolean) => {
    setHapticEnabled(value);
    saveSettings({ hapticEnabled: value });

    if (value) triggerHaptic(true);
  };

  const handleThemeChange = (value: "system" | "light" | "dark") => {
    setThemePreference(value);
    saveSettings({ themePreference: value });

    onShowSnackbar({
      text: "Theme preference saved on this device.",
      type: "success",
    });
  };

  const handleAccentChange = (
    value: "emerald" | "blue" | "purple" | "amber" | "rose"
  ) => {
    setAccent(value);
    saveSettings({ accent: value });
  };

  const handleSaveLocalManual = () => {
    const success = saveTasksLocally(tasks);
    setStorageStats(getLocalStorageStats());

    onShowSnackbar({
      text: success
        ? `Saved ${tasks.length} tasks on this device.`
        : "Could not save tasks locally.",
      type: success ? "success" : "error",
    });
  };

  const handleDownloadBackup = () => {
    downloadTasksJson(tasks, userName.trim() || "User");

    onShowSnackbar({
      text: "If your browser supports downloads, the JSON backup is ready.",
      type: "success",
    });
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const importedTasks: unknown = Array.isArray(parsed)
        ? parsed
        : parsed?.tasks;

      if (!Array.isArray(importedTasks)) {
        throw new Error("Backup must contain a tasks array.");
      }

      const validTasks = importedTasks.filter(
        (task): task is Task =>
          task !== null &&
          typeof task === "object" &&
          typeof task.title === "string"
      );

      const success = saveTasksLocally(validTasks);

      if (!success) {
        throw new Error("Could not save imported tasks.");
      }

      setStorageStats(getLocalStorageStats());
      onTasksUpdated();

      onShowSnackbar({
        text: `Imported ${validTasks.length} tasks to this device.`,
        type: "success",
      });
    } catch (error) {
      console.error("Import failed:", error);

      onShowSnackbar({
        text: "Import failed. Please select a valid task backup JSON file.",
        type: "error",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClearLocal = () => {
    if (
      !confirm(
        "Clear the local backup? Your currently displayed tasks may be saved again automatically."
      )
    ) {
      return;
    }

    clearLocalBackup();
    setStorageStats(getLocalStorageStats());

    onShowSnackbar({
      text: "Local backup cleared.",
      type: "info",
    });
  };

  const handleResetTasks = () => {
    if (
      !confirm(
        "Delete all tasks from this device? This cannot be undone unless you have a backup."
      )
    ) {
      return;
    }

    setIsResetting(true);

    try {
      const success = saveTasksLocally([]);

      if (!success) {
        throw new Error("Could not clear local tasks.");
      }

      setStorageStats(getLocalStorageStats());
      onTasksUpdated();

      onShowSnackbar({
        text: "Tasks cleared from this device.",
        type: "success",
      });
    } catch (error) {
      console.error("Task reset failed:", error);

      onShowSnackbar({
        text: "Could not clear tasks.",
        type: "error",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();

    const name = userName.trim();

    if (!name) {
      onShowSnackbar({
        text: "Please enter a name.",
        type: "error",
      });
      return;
    }

    setIsSavingProfile(true);

    try {
      localStorage.setItem(PROFILE_KEY, name);

      if (user) {
        setUser({ ...user, name });
      }

      onShowSnackbar({
        text: "Profile name saved on this device.",
        type: "success",
      });
    } catch (error) {
      console.error("Could not save profile:", error);

      onShowSnackbar({
        text: "Could not save profile.",
        type: "error",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const accents: {
    id: "emerald" | "blue" | "purple" | "amber" | "rose";
    label: string;
    color: string;
  }[] = [
    { id: "emerald", label: "Android Green", color: "#10b981" },
    { id: "blue", label: "Material Blue", color: "#3b82f6" },
    { id: "purple", label: "Lavender", color: "#8b5cf6" },
    { id: "amber", label: "Sunset", color: "#f59e0b" },
    { id: "rose", label: "Coral", color: "#f43f5e" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize your task manager and local device storage.
        </p>
      </div>

      <section className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Theme Mode
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "light" as const, label: "Light", icon: Sun },
              { id: "dark" as const, label: "Dark", icon: Moon },
              { id: "system" as const, label: "System", icon: Monitor },
            ].map((mode) => {
              const Icon = mode.icon;
              const selected = themePreference === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleThemeChange(mode.id)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    selected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            Material Accent Color
          </label>

          <div className="flex items-center gap-3 flex-wrap">
            {accents.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAccentChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  accent === item.id
                    ? "ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-neutral-900 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
                {accent === item.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Volume2 className="w-4 h-4 text-emerald-500" />
          <span>Sounds & Haptic Feedback</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Task Completion Chime
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Play a sound when a task is completed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playTaskDoneSound(true)}
              className="text-[11px] px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              Test
            </button>

            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => handleSoundToggle(event.target.checked)}
              aria-label="Enable task completion sound"
              className="w-5 h-5 accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <Vibrate className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Haptic Vibration
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Vibration feedback where supported.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={hapticEnabled}
            onChange={(event) => handleHapticToggle(event.target.checked)}
            aria-label="Enable haptic feedback"
            className="w-5 h-5 accent-emerald-600 cursor-pointer"
          />
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <HardDrive className="w-4 h-4 text-blue-500" />
            <span>Local Storage & Backup</span>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Offline
          </span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Tasks are stored on this device. No server or account is required.
                    Export a JSON backup regularly to protect your data.
        </p>

        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/70 dark:border-neutral-700 text-xs space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-500">Saved tasks:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {storageStats.count} tasks ({Math.round(storageStats.bytes / 1024)} KB)
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-neutral-500">Storage:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              This device only
            </span>
          </div>

          {storageStats.lastSaved && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-neutral-500">Last saved:</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                {new Date(storageStats.lastSaved).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleSaveLocalManual}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            Force Save Locally
          </button>

          <button
            type="button"
            onClick={handleDownloadBackup}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Export Tasks (JSON)
          </button>

          <label className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-purple-500" />
            Import Tasks (JSON)
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleClearLocal}
            className="py-2 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            Clear Local Backup
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Task Reset</span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Clear all tasks from this device. No demo tasks will be created.
        </p>

        <button
          type="button"
          onClick={handleResetTasks}
          disabled={isResetting}
          className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
          {isResetting ? "Clearing..." : "Clear All Tasks"}
        </button>
      </section>

      <section className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <User className="w-4 h-4 text-emerald-500" />
          <span>Local Profile</span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          This name is stored only on your device.
        </p>

        <form onSubmit={handleSaveProfile} className="flex items-center gap-2">
          <input
            type="text"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Your name (optional)"
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={isSavingProfile || !userName.trim()}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Clear Session
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline"
          >
            Account Options
          </button>
        </div>
      </section>

      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 text-xs text-neutral-500 dark:text-neutral-400 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />

        <div>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">
            Simple Android Task Manager v1.0
          </p>
          <p className="mt-0.5">
            Designed for Android with offline tasks, local settings, sound
            feedback, and JSON backup. No PostgreSQL connection is used here.
          </p>
        </div>
      </div>
    </div>
  );
}