import { Task, Category } from "./types";

const LOCAL_STORAGE_KEY = "android_tasks_local_backup";
const LAST_SAVED_KEY = "android_tasks_last_saved";
const CATEGORIES_STORAGE_KEY = "android_categories_local_backup";

export function saveTasksLocally(tasks: Task[]) {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify(tasks);
    localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    localStorage.setItem(LAST_SAVED_KEY, new Date().toISOString());
  } catch (e) {
    console.error("Failed to save tasks locally", e);
  }
}

export function loadTasksLocally(): {
  tasks: Task[];
  lastSaved: string | null;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const lastSaved = localStorage.getItem(LAST_SAVED_KEY);

    if (!data) return null;

    const tasks = JSON.parse(data);

    if (!Array.isArray(tasks)) return null;

    return {
      tasks,
      lastSaved,
    };
  } catch (e) {
    console.error("Failed to load local tasks", e);
    return null;
  }
}

export function saveCategoriesLocally(categories: Category[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories)
    );
  } catch (e) {
    console.error("Failed to save categories locally", e);
  }
}

export function loadCategoriesLocally(): Category[] | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (!data) return null;

    const categories = JSON.parse(data);

    if (!Array.isArray(categories)) return null;

    return categories;
  } catch (e) {
    console.error("Failed to load categories locally", e);
    return null;
  }
}

export function getLocalStorageStats(): {
  count: number;
  bytes: number;
  lastSaved: string | null;
} {
  if (typeof window === "undefined") {
    return { count: 0, bytes: 0, lastSaved: null };
  }

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const lastSaved = localStorage.getItem(LAST_SAVED_KEY);

    if (!data) {
      return { count: 0, bytes: 0, lastSaved: null };
    }

    const parsed = JSON.parse(data);

    return {
      count: Array.isArray(parsed) ? parsed.length : 0,
      bytes: new Blob([data]).size,
      lastSaved,
    };
  } catch {
    return { count: 0, bytes: 0, lastSaved: null };
  }
}

export function clearLocalBackup() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(LAST_SAVED_KEY);
  localStorage.removeItem(CATEGORIES_STORAGE_KEY);
}

export function downloadTasksJson(
  tasks: Task[],
  userName: string = "alex"
) {
  if (typeof window === "undefined") return;

  const backup = {
    appName: "Simple Android Task Manager",
    exportedAt: new Date().toISOString(),
    user: userName,
    tasksCount: tasks.length,
    tasks,
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `android-tasks-backup-${new Date()
    .toISOString()
    .split("T")[0]}.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}