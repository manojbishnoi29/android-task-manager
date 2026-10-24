"use client";

import React, { useState, useMemo } from "react";
import { Task, Category, Subtask, ViewTab } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { useTheme } from "./ThemeContext";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  Inbox,
  X,
  ListTodo,
} from "lucide-react";

interface HomeTasksViewProps {
  tasks: Task[];
  categories: Category[];
  currentTab: ViewTab;
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onToggleComplete: (task: Task) => void;
  onToggleStar: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtask: Subtask) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onOpenNewTask: () => void;
}

export function HomeTasksView({
  tasks,
  categories,
  currentTab,
  selectedCategory,
  onSelectCategory,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onOpenNewTask,
}: HomeTasksViewProps) {
  const { user } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterChip, setFilterChip] = useState<"all" | "today" | "starred" | "upcoming" | "completed">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Determine greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const formattedToday = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Compute daily progress
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayDone = todayTasks.filter((t) => t.isCompleted);
  const todayPercentage = todayTasks.length > 0 ? Math.round((todayDone.length / todayTasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Sidebar Tab filter
    if (currentTab === "today") {
      result = result.filter((t) => t.dueDate === todayStr);
    } else if (currentTab === "starred") {
      result = result.filter((t) => t.isStarred);
    }

    // Secondary Chip filter (if on 'all' view)
    if (currentTab === "all") {
      if (filterChip === "today") {
        result = result.filter((t) => t.dueDate === todayStr);
      } else if (filterChip === "starred") {
        result = result.filter((t) => t.isStarred);
      } else if (filterChip === "upcoming") {
        result = result.filter((t) => !t.isCompleted && (!t.dueDate || t.dueDate > todayStr));
      } else if (filterChip === "completed") {
        result = result.filter((t) => t.isCompleted);
      }
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((t) => t.categoryId === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.subtasks.some((st) => st.title.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      // Always put completed tasks at the bottom unless filtering specifically by completed
      if (filterChip !== "completed") {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
      }

      if (sortBy === "priority") {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const wA = priorityWeight[a.priority];
        const wB = priorityWeight[b.priority];
        return sortOrder === "asc" ? wB - wA : wA - wB; // high first by default
      } else if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else {
        // Due date sort
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const comp = a.dueDate.localeCompare(b.dueDate);
        return sortOrder === "asc" ? comp : -comp;
      }
    });

    return result;
  }, [tasks, currentTab, filterChip, selectedCategory, searchQuery, sortBy, sortOrder, todayStr]);

  const activeCategoryObject = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5 pb-28 sm:pb-12 animate-in fade-in duration-150">
      {/* 1. Header with greeting and date */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            {formattedToday}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
            {greeting}, {user?.name ? user.name.split(" ")[0] : "Alex"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {todayTasks.length === 0
              ? "No tasks due today. Enjoy your day!"
              : `${todayTasks.length - todayDone.length} tasks to do today • ${todayDone.length} completed`}
          </p>
        </div>
      </div>

      {/* 2. Today's Progress Card (clean Material 3 card) */}
      {todayTasks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-800 text-white shadow-lg shadow-emerald-700/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Today&apos;s Momentum
              </span>
            </div>
            <span className="text-xs font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
              {todayPercentage}% Done
            </span>
          </div>

          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden my-2.5">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${todayPercentage}%` }}
            />
          </div>

          <p className="text-xs text-emerald-100 mt-1">
            {todayPercentage === 100
              ? "All caught up for today! Fantastic job! 🌟"
              : `${todayDone.length} of ${todayTasks.length} tasks checked off. Keep it up!`}
          </p>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your tasks, subtasks, notes..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. Filter Chips (Clean Android Pill buttons) */}
      <div className="space-y-2">
        {/* Main status chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all" as const, label: "All Tasks" },
            { id: "today" as const, label: "Today", badge: todayTasks.length },
            { id: "starred" as const, label: "Important ⭐" },
            { id: "upcoming" as const, label: "Upcoming" },
            { id: "completed" as const, label: "Done ✓" },
          ].map((chip) => {
            const isSelected = filterChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterChip(chip.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
              >
                <span>{chip.label}</span>
                {chip.badge !== undefined && chip.badge > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-white/25 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {chip.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category horizontal pill selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => onSelectCategory(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              !selectedCategory
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white font-semibold"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-850"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(isSelected ? null : c.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  isSelected
                    ? "ring-2 ring-emerald-500 font-semibold"
                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300"
                }`}
                style={{
                  borderColor: isSelected ? c.color : undefined,
                  backgroundColor: isSelected ? `${c.color}15` : undefined,
                  color: isSelected ? c.color : undefined,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Sort & Active Filter Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
        <div className="flex items-center gap-1.5">
          <span>
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
          {activeCategoryObject && (
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              in {activeCategoryObject.name}
            </span>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "title")}
            className="bg-transparent text-xs font-semibold text-neutral-700 dark:text-neutral-300 border-none focus:outline-none cursor-pointer"
          >
            <option value="date" className="dark:bg-neutral-800">Due Date</option>
            <option value="priority" className="dark:bg-neutral-800">Priority</option>
            <option value="title" className="dark:bg-neutral-800">Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title="Toggle sort direction"
            className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-14 px-4 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">
            {searchQuery ? "No matching tasks found" : "No tasks here yet!"}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 leading-relaxed">
            {searchQuery
              ? "Try adjusting your search terms or clearing the filter chips."
              : "Tap the '+' button below to add your first simple task or to-do item."}
          </p>
          <button
            onClick={onOpenNewTask}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Add a Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onToggleStar={onToggleStar}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSubtask={onToggleSubtask}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
