"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/lib/types";

interface ThemeContextType {
  theme: "light" | "dark";
  themePreference: "system" | "light" | "dark";
  setThemePreference: (t: "system" | "light" | "dark") => void;
  accent: "emerald" | "blue" | "purple" | "amber" | "rose";
  setAccent: (a: "emerald" | "blue" | "purple" | "amber" | "rose") => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  hapticEnabled: boolean;
  setHapticEnabled: (h: boolean) => void;
  deviceViewMode: "phone" | "fluid";
  setDeviceViewMode: (m: "phone" | "fluid") => void;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  accentClasses: {
    bg: string;
    text: string;
    border: string;
    lightBg: string;
    badge: string;
    ring: string;
    gradient: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentStyles = {
  emerald: {
    bg: "bg-emerald-600 hover:bg-emerald-700 text-white",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-600 dark:border-emerald-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    ring: "focus:ring-emerald-500",
    gradient: "from-emerald-600 to-teal-700",
  },
  blue: {
    bg: "bg-blue-600 hover:bg-blue-700 text-white",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-600 dark:border-blue-500",
    lightBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    ring: "focus:ring-blue-500",
    gradient: "from-blue-600 to-indigo-700",
  },
  purple: {
    bg: "bg-purple-600 hover:bg-purple-700 text-white",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-600 dark:border-purple-500",
    lightBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    ring: "focus:ring-purple-500",
    gradient: "from-purple-600 to-violet-700",
  },
  amber: {
    bg: "bg-amber-600 hover:bg-amber-700 text-white",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-600 dark:border-amber-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    ring: "focus:ring-amber-500",
    gradient: "from-amber-600 to-orange-700",
  },
  rose: {
    bg: "bg-rose-600 hover:bg-rose-700 text-white",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-600 dark:border-rose-500",
    lightBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    ring: "focus:ring-rose-500",
    gradient: "from-rose-600 to-pink-700",
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = useState<"system" | "light" | "dark">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState<"emerald" | "blue" | "purple" | "amber" | "rose">("emerald");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [deviceViewMode, setDeviceViewMode] = useState<"phone" | "fluid">("fluid");
  const [user, setUser] = useState<UserProfile | null>(null);

  // Sync theme with system and html class
  useEffect(() => {
    const updateTheme = () => {
      let isDark = false;
      if (themePreference === "dark") {
        isDark = true;
      } else if (themePreference === "system") {
        isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      setResolvedTheme(isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    updateTheme();

    if (themePreference === "system" && window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => updateTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [themePreference]);

  // Sync user preferences when user loads
  useEffect(() => {
    if (user) {
      if (user.theme) setThemePreference(user.theme);
      if (user.accentColor) setAccent(user.accentColor);
      if (typeof user.soundEnabled === "boolean") setSoundEnabled(user.soundEnabled);
      if (typeof user.hapticEnabled === "boolean") setHapticEnabled(user.hapticEnabled);
    }
  }, [user]);

  const value: ThemeContextType = {
    theme: resolvedTheme,
    themePreference,
    setThemePreference,
    accent,
    setAccent,
    soundEnabled,
    setSoundEnabled,
    hapticEnabled,
    setHapticEnabled,
    deviceViewMode,
    setDeviceViewMode,
    user,
    setUser,
    accentClasses: accentStyles[accent] || accentStyles.emerald,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
