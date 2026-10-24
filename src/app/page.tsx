"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Task, Category, ViewTab, Subtask } from "@/lib/types";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { AndroidPhoneFrame } from "@/components/AndroidPhoneFrame";
import { HomeTasksView } from "@/components/HomeTasksView";
import { CategoriesView } from "@/components/CategoriesView";
import { CalendarView } from "@/components/CalendarView";
import { StatsView } from "@/components/StatsView";
import { SettingsView } from "@/components/SettingsView";
import { TaskModal } from "@/components/TaskModal";
import { CategoryModal } from "@/components/CategoryModal";
import { AuthModal } from "@/components/AuthModal";
import { Snackbar, SnackbarMessage } from "@/components/Snackbar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { saveTasksLocally, loadTasksLocally } from "@/lib/storage";

function TaskManagerApp() {
  const { user, setUser, deviceViewMode } = useTheme();

  // Core data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation states
  const [currentTab, setCurrentTab] = useState<ViewTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Snackbar notifications with Undo support
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  const showSnackbar = useCallback(
    (msg: { text: string; type?: "success" | "error" | "info"; actionLabel?: string; onAction?: () => void }) => {
      setSnackbar({
        id: `snack-${Date.now()}`,
        text: msg.text,
        type: msg.type || "success",
        actionLabel: msg.actionLabel,
        onAction: msg.onAction,
      });
    },
    []
  );

  // Fetch initial user session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }, [setUser]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        const loadedTasks: Task[] = data.tasks || [];
        setTasks(loadedTasks);
        // Save to local storage cache
        saveTasksLocally(loadedTasks);
      } else {
        // Fallback to local storage
        const local = loadTasksLocally();
        if (local?.tasks) {
          setTasks(local.tasks);
        }
      }
    } catch (e) {
      console.error("Failed to fetch tasks, using local storage", e);
      const local = loadTasksLocally();
      if (local?.tasks) {
        setTasks(local.tasks);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchCategories();
    fetchTasks();
  }, [fetchSession, fetchCategories, fetchTasks]);

  // 1. Task Toggle Complete (Optimistic)
  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = !task.isCompleted;

    // Optimistic update
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              isCompleted: updatedStatus,
              completedAt: updatedStatus ? new Date().toISOString() : null,
            }
          : t
      );
      saveTasksLocally(next);
      return next;
    });

    try {
      const res = await fetch(`/api/tasks/${task.id}/toggle`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to toggle task");
      }
    } catch {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t))
      );
      showSnackbar({ text: "Failed to update task status", type: "error" });
    }
  };

  // 2. Task Toggle Star (Optimistic)
  const handleToggleStar = async (task: Task) => {
    const updatedStarred = !task.isStarred;

    setTasks((prev) => {
      const next = prev.map((t) => (t.id === task.id ? { ...t, isStarred: updatedStarred } : t));
      saveTasksLocally(next);
      return next;
    });

    try {
      await fetch(`/api/tasks/${task.id}/star`, { method: "POST" });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, isStarred: task.isStarred } : t))
      );
    }
  };

  // 3. Delete Task (Optimistic with UNDO action)
  const handleDeleteTask = async (taskToDelete: Task) => {
    const originalTasks = [...tasks];

    // Optimistically remove
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskToDelete.id);
      saveTasksLocally(next);
      return next;
    });

    let isUndone = false;

    showSnackbar({
      text: `Deleted "${taskToDelete.title}"`,
      type: "info",
      actionLabel: "Undo",
      onAction: async () => {
        isUndone = true;
        // Restore locally
        setTasks(originalTasks);
        saveTasksLocally(originalTasks);
        // Restore remotely by creating
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: taskToDelete.title,
            description: taskToDelete.description,
            categoryId: taskToDelete.categoryId,
            dueDate: taskToDelete.dueDate,
            dueTime: taskToDelete.dueTime,
            priority: taskToDelete.priority,
            isStarred: taskToDelete.isStarred,
            subtasks: taskToDelete.subtasks.map((s) => ({ title: s.title, isCompleted: s.isCompleted })),
          }),
        });
        fetchTasks();
      },
    });

    // Run delete after brief delay if not undone
    setTimeout(async () => {
      if (!isUndone) {
        try {
          await fetch(`/api/tasks/${taskToDelete.id}`, { method: "DELETE" });
        } catch (e) {
          console.error("Delete task failed", e);
        }
      }
    }, 4500);
  };

  // 4. Save Task (Create or Update)
  const handleSaveTask = async (taskData: {
    id?: string;
    title: string;
    description?: string | null;
    categoryId?: string | null;
    dueDate?: string | null;
    dueTime?: string | null;
    priority: "low" | "medium" | "high";
    isStarred: boolean;
    hasReminder: boolean;
    subtasks?: { id?: string; title: string; isCompleted: boolean }[];
  }) => {
    const isEditing = Boolean(taskData.id);

    try {
      if (isEditing) {
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks((prev) => {
            const next = prev.map((t) => (t.id === taskData.id ? data.task : t));
            saveTasksLocally(next);
            return next;
          });
          showSnackbar({ text: "Task updated successfully", type: "success" });
        }
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (res.ok) {
          const data = await res.json();
          setTasks((prev) => {
            const next = [data.task, ...prev];
            saveTasksLocally(next);
            return next;
          });
          showSnackbar({ text: "Task created successfully", type: "success" });
        }
      }

      fetchCategories();
    } catch (e) {
      console.error(e);
      showSnackbar({ text: "Failed to save task", type: "error" });
    }
  };

  // 5. Toggle Subtask (Optimistic)
  const handleToggleSubtask = async (taskId: string, subtask: Subtask) => {
    const updatedStatus = !subtask.isCompleted;

    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtask.id ? { ...st, isCompleted: updatedStatus } : st
            ),
          };
        }
        return t;
      });
      saveTasksLocally(next);
      return next;
    });

    try {
      await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId: subtask.id, isCompleted: updatedStatus }),
      });
    } catch {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtask.id ? { ...st, isCompleted: subtask.isCompleted } : st
              ),
            };
          }
          return t;
        })
      );
    }
  };

  // 6. Add subtask directly to existing task
  const handleAddSubtask = async (taskId: string, title: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => {
          const next = prev.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: [...t.subtasks, data.subtask],
              };
            }
            return t;
          });
          saveTasksLocally(next);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 7. Categories CRUD
  const handleSaveCategory = async (catData: { id?: string; name: string; color: string; icon: string }) => {
    const isEditing = Boolean(catData.id);

    try {
      if (isEditing) {
        const res = await fetch(`/api/categories/${catData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catData),
        });
        if (res.ok) {
          showSnackbar({ text: "Category updated", type: "success" });
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catData),
        });
        if (res.ok) {
          showSnackbar({ text: "Category created", type: "success" });
        }
      }
      fetchCategories();
      fetchTasks();
    } catch (e) {
      console.error(e);
      showSnackbar({ text: "Failed to save category", type: "error" });
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? Tasks in this category will keep existing without a category.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      if (res.ok) {
        showSnackbar({ text: `Deleted category "${cat.name}"`, type: "info" });
        if (selectedCategory === cat.id) {
          setSelectedCategory(null);
        }
        fetchCategories();
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
      showSnackbar({ text: "Failed to delete category", type: "error" });
    }
  };

  // 8. Auth handlers
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      showSnackbar({ text: "Signed out successfully", type: "info" });
      fetchSession();
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Computed counts for badges
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && !t.isCompleted).length;
  const starredCount = tasks.filter((t) => t.isStarred && !t.isCompleted).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Tablet & Desktop Sidebar Navigation */}
      {deviceViewMode === "fluid" && (
        <div className="hidden md:flex h-full">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
            totalTasksCount={tasks.filter((t) => !t.isCompleted).length}
            todayTasksCount={todayCount}
            starredTasksCount={starredCount}
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenNewCategory={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar in Fluid Mode */}
        {deviceViewMode === "fluid" && (
          <TopBar
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {/* Viewport wrapped with AndroidPhoneFrame when in phone mode */}
        <AndroidPhoneFrame>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="max-w-md mx-auto p-6 space-y-4">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse w-3/4"></div>
                <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
                <div className="space-y-3 pt-4">
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                {currentTab === "all" || currentTab === "today" || currentTab === "starred" ? (
                  <HomeTasksView
                    tasks={tasks}
                    categories={categories}
                    currentTab={currentTab}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onToggleComplete={handleToggleComplete}
                    onToggleStar={handleToggleStar}
                    onEdit={(t) => {
                      setTaskToEdit(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onOpenNewTask={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                  />
                ) : currentTab === "categories" ? (
                  <CategoriesView
                    categories={categories}
                    tasks={tasks}
                    onSelectCategory={(id) => {
                      setSelectedCategory(id);
                      setCurrentTab("all");
                    }}
                    onOpenNewCategory={() => {
                      setCategoryToEdit(null);
                      setIsCategoryModalOpen(true);
                    }}
                    onEditCategory={(cat) => {
                      setCategoryToEdit(cat);
                      setIsCategoryModalOpen(true);
                    }}
                    onDeleteCategory={handleDeleteCategory}
                  />
                ) : currentTab === "calendar" ? (
                  <CalendarView
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onToggleStar={handleToggleStar}
                    onEdit={(t) => {
                      setTaskToEdit(t);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleSubtask={handleToggleSubtask}
                    onAddSubtask={handleAddSubtask}
                    onOpenNewTask={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                  />
                ) : currentTab === "stats" ? (
                  <StatsView tasks={tasks} categories={categories} />
                ) : (
                  <SettingsView
                    tasks={tasks}
                    onTasksUpdated={fetchTasks}
                    onShowSnackbar={showSnackbar}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </div>

          {/* Android Mobile Bottom Navigation (shown on mobile or inside phone shell) */}
          <div className={deviceViewMode === "phone" ? "block" : "sm:hidden"}>
            <BottomNav
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              todayCount={todayCount}
            />
          </div>

          {/* Floating Action Button (FAB) for adding tasks */}
          <FloatingActionButton
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        </AndroidPhoneFrame>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        initialCategory={selectedCategory || undefined}
      />

      {/* Category Creation & Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          fetchTasks();
          fetchCategories();
          showSnackbar({ text: "Signed in successfully!", type: "success" });
        }}
      />

      {/* Android Style Snackbar / Toast */}
      <Snackbar message={snackbar} onClose={() => setSnackbar(null)} />
    </div>
  );
}

export default function Page() {
  return (
    <ThemeProvider>
      <TaskManagerApp />
    </ThemeProvider>
  );
}
