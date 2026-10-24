export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
  taskCount?: number;
  completedCount?: number;
}

export interface Task {
  id: string;
  userId: string;
  categoryId?: string | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: Date | string | null;
  dueDate?: string | null; // YYYY-MM-DD
  dueTime?: string | null; // HH:MM
  priority: "low" | "medium" | "high";
  isStarred: boolean;
  hasReminder: boolean;
  reminderTime?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  category?: Category | null;
  subtasks: Subtask[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  theme: "system" | "light" | "dark";
  accentColor: "emerald" | "blue" | "purple" | "amber" | "rose";
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoSaveLocal: boolean;
}

export type ViewTab = "all" | "today" | "starred" | "categories" | "calendar" | "stats" | "settings";
