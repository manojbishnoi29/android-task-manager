import { Task, Category } from "./types";

const LOCAL_STORAGE_KEY = "android_tasks_local_backup";
const LAST_SAVED_KEY = "android_tasks_last_saved";
const CATEGORIES_STORAGE_KEY = "android_categories_local_backup";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Save tasks on this device
export function saveTasksLocally(tasks: Task[]): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(LAST_SAVED_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("Failed to save tasks locally:", error);
    return false;
  }
}

// Load tasks saved on this device
export function loadTasksLocally(): {
  tasks: Task[];
  lastSaved: string | null;
} | null {
  if (!isBrowser()) return null;

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const lastSaved = localStorage.getItem(LAST_SAVED_KEY);

    if (!data) return null;

    const tasks: unknown = JSON.parse(data);

    if (!Array.isArray(tasks)) return null;

    return {
      tasks: tasks as Task[],
      lastSaved,
    };
  } catch (error) {
    console.error("Failed to load local tasks:", error);
    return null;
  }
}

// Save categories on this device
export function saveCategoriesLocally(categories: Category[]): boolean {
  if (!isBrowser()) return false;

  try {
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories)
    );
    return true;
  } catch (error) {
    console.error("Failed to save categories locally:", error);
    return false;
  }
}

// Load categories saved on this device
export function loadCategoriesLocally(): Category[] | null {
  if (!isBrowser()) return null;

  try {
    const data = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (!data) return null;

    const categories: unknown = JSON.parse(data);

    if (!Array.isArray(categories)) return null;

    return categories as Category[];
  } catch (error) {
    console.error("Failed to load local categories:", error);
    return null;
  }
}

// Local storage information
export function getLocalStorageStats(): {
  count: number;
  bytes: number;
  lastSaved: string | null;
} {
  if (!isBrowser()) {
    return { count: 0, bytes: 0, lastSaved: null };
  }

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const lastSaved = localStorage.getItem(LAST_SAVED_KEY);

    if (!data) {
      return { count: 0, bytes: 0, lastSaved: null };
    }

    const tasks: unknown = JSON.parse(data);

    return {
      count: Array.isArray(tasks) ? tasks.length : 0,
      bytes: new Blob([data]).size,
      lastSaved,
    };
  } catch (error) {
    console.error("Failed to read local storage stats:", error);
    return { count: 0, bytes: 0, lastSaved: null };
  }
}

// Clear local data only when explicitly requested
export function clearLocalBackup(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(LAST_SAVED_KEY);
  localStorage.removeItem(CATEGORIES_STORAGE_KEY);
}

// Export tasks as a JSON backup
export function downloadTasksJson(
  tasks: Task[],
  userName: string = "User"
): void {
  if (!isBrowser()) return;

  try {
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
    const link = document.createElement("a");

    link.href = url;
    link.download = `android-tasks-backup-${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export tasks:", error);
  }
}