import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Android Task Manager - Simple Mobile To-Do App for Beginners",
  description:
    "A clean, simple Android task manager with home screen, local offline storage, quick checklists, audio chimes, and realistic daily beginner tasks.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://api.dicebear.com/7.x/bottts/svg?seed=android-tasks",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased font-sans select-none overflow-hidden">
        {children}
      </body>
    </html>
  );
}
