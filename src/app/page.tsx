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
import {
  saveTasksLocally,
  loadTasksLocally,
  saveCategoriesLocally,
  loadCategoriesLocally,
} from "@/lib/storage";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function TaskManagerApp() {
  const { setUser, deviceViewMode } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<ViewTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  const showSnackbar = useCallback(
    (msg: {
      text: string;
      type?: "success" | "error" | "info";
      actionLabel?: string;
      onAction?: () => void;
    }) => {
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

  // Load saved data from this phone only.
  useEffect(() => {
    try {
      const local = loadTasksLocally();
      const savedCategories = loadCategoriesLocally();

      setTasks(local?.tasks || []);
      setCategories(savedCategories || []);
    } catch (error) {
      console.error("Could not load local data", error);
      showSnackbar({
        text: "Could not load saved data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const persistTasks = (next: Task[]) => {
    setTasks(next);
    saveTasksLocally(next);
  };

  const persistCategories = (next: Category[]) => {
    setCategories(next);
    saveCategoriesLocally(next);
  };

  const handleToggleComplete = (task: Task) => {
    const next = tasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            isCompleted: !item.isCompleted,
            completedAt: !item.isCompleted
              ? new Date().toISOString()
              : null,
          }
        : item
    );

    persistTasks(next);
  };

  const handleToggleStar = (task: Task) => {
    persistTasks(
      tasks.map((item) =>
        item.id === task.id
          ? { ...item, isStarred: !item.isStarred }
          : item
      )
    );
  };

  const handleDeleteTask = (task: Task) => {
    const previousTasks = [...tasks];
    const next = tasks.filter((item) => item.id !== task.id);

    persistTasks(next);

    showSnackbar({
      text: `Deleted "${task.title}"`,
      type: "info",
      actionLabel: "Undo",
      onAction: () => persistTasks(previousTasks),
    });
  };

  const handleSaveTask = (taskData: {
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
    const now = new Date().toISOString();

    if (taskData.id) {
      const next = tasks.map((task) => {
        if (task.id !== taskData.id) return task;

        return {
          ...task,
          ...taskData,
          id: task.id,
          updatedAt: now,
          subtasks: (taskData.subtasks || []).map((subtask) => ({
            id: subtask.id || makeId(),
            title: subtask.title,
            isCompleted: subtask.isCompleted,
          })),
        } as Task;
      });

      persistTasks(next);
      showSnackbar({ text: "Task updated", type: "success" });
    } else {
      const newTask = {
        ...taskData,
        id: makeId(),
        isCompleted: false,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        subtasks: (taskData.subtasks || []).map((subtask) => ({
          id: subtask.id || makeId(),
          title: subtask.title,
          isCompleted: subtask.isCompleted,
        })),
      } as Task;

      persistTasks([newTask, ...tasks]);
      showSnackbar({ text: "Task created", type: "success" });
    }

    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleToggleSubtask = (taskId: string, subtask: Subtask) => {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((item) =>
                item.id === subtask.id
                  ? { ...item, isCompleted: !item.isCompleted }
                  : item
              ),
            }
          : task
      )
    );
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...task.subtasks,
                {
                  id: makeId(),
                  title: trimmedTitle,
                  isCompleted: false,
                },
              ],
            }
          : task
      )
    );
  };

  const handleSaveCategory = (catData: {
    id?: string;
    name: string;
    color: string;
    icon: string;
  }) => {
    const name = catData.name.trim();
    if (!name) return;

    if (catData.id) {
      persistCategories(
        categories.map((category) =>
          category.id === catData.id
            ? { ...category, ...catData, name }
            : category
        )
      );
      showSnackbar({ text: "Category updated", type: "success" });
    } else {
      const newCategory = {
        ...catData,
        id: makeId(),
        name,
      } as Category;

      persistCategories([...categories, newCategory]);
      showSnackbar({ text: "Category created", type: "success" });
    }

    setIsCategoryModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleDeleteCategory = (category: Category) => {
    if (
      !confirm(
        `Delete category "${category.name}"? Tasks in this category will remain without a category.`
      )
    ) {
      return;
    }

    persistCategories(
      categories.filter((item) => item.id !== category.id)
    );

    persistTasks(
      tasks.map((task) =>
        task.categoryId === category.id
          ? { ...task, categoryId: null }
          : task
      )
    );

    if (selectedCategory === category.id) {
      setSelectedCategory(null);
    }

    showSnackbar({
      text: `Deleted category "${category.name}"`,
      type: "info",
    });
  };

  const handleLogout = () => {
    setUser(null);
    showSnackbar({
      text: "Offline mode: no account is connected",
      type: "info",
    });
  };

  const todayStr = new Date().toLocaleDateString("en-CA");
  const todayCount = tasks.filter(
    (task) => task.dueDate === todayStr && !task.isCompleted
  ).length;
  const starredCount = tasks.filter(
    (task) => task.isStarred && !task.isCompleted
  ).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {deviceViewMode === "fluid" && (
        <div className="hidden md:flex h-full">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categories={categories}
            totalTasksCount={tasks.filter((task) => !task.isCompleted).length}
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

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {deviceViewMode === "fluid" && (
          <TopBar
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        <AndroidPhoneFrame>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="max-w-md mx-auto p-6 space-y-4">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse w-3/4" />
                <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
                <div className="space-y-3 pt-4">
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {currentTab === "all" ||
                currentTab === "today" ||
                currentTab === "starred" ? (
                  <HomeTasksView
                    tasks={tasks}
                    categories={categories}
                    currentTab={currentTab}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onToggleComplete={handleToggleComplete}
                    onToggleStar={handleToggleStar}
                    onEdit={(task) => {
                      setTaskToEdit(task);
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
                    onEditCategory={(category) => {
                      setCategoryToEdit(category);
                      setIsCategoryModalOpen(true);
                    }}
                    onDeleteCategory={handleDeleteCategory}
                  />
                ) : currentTab === "calendar" ? (
                  <CalendarView
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onToggleStar={handleToggleStar}
                    onEdit={(task) => {
                      setTaskToEdit(task);
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
                    onTasksUpdated={() => {
                      const local = loadTasksLocally();
                      if (local?.tasks) setTasks(local.tasks);
                    }}
                    onShowSnackbar={showSnackbar}
                    onOpenAuth={() =>
                      showSnackbar({
                        text: "Sign-in is unavailable in offline mode",
                        type: "info",
                      })
                    }
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </div>

          <div className={deviceViewMode === "phone" ? "block" : "sm:hidden"}>
            <BottomNav
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              todayCount={todayCount}
            />
          </div>

          <FloatingActionButton
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
          />
        </AndroidPhoneFrame>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        initialCategory={selectedCategory || undefined}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
          showSnackbar({
            text: "This app is configured for offline use",
            type: "info",
          });
        }}
      />

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