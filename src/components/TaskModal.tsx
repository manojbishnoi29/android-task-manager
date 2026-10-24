"use client";

import React, { useState, useEffect } from "react";
import { Task, Category } from "@/lib/types";
import { useTheme } from "./ThemeContext";
import {
  X,
  Calendar,
  Clock,
  Star,
  Plus,
  Trash2,
  Tag,
  Check,
  Sparkles,
} from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
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
  }) => Promise<void>;
  taskToEdit?: Task | null;
  categories: Category[];
  initialCategory?: string;
}

const BEGINNER_PRESETS = [
  { label: "🛒 Grocery shopping", title: "Pick up fresh groceries & milk", priority: "high" as const },
  { label: "📞 Call family", title: "Call Mom for weekend dinner plans", priority: "high" as const },
  { label: "📚 Language study", title: "15 min Duolingo Spanish lesson", priority: "medium" as const },
  { label: "💡 Pay bills", title: "Pay electric & Wi-Fi internet bills", priority: "high" as const },
  { label: "🏃 Daily workout", title: "30-minute evening walk & stretch", priority: "low" as const },
  { label: "🪴 Water plants", title: "Water indoor snake plant & herbs", priority: "low" as const },
];

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  initialCategory,
}: TaskModalProps) {
  const { accentClasses } = useTheme();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isStarred, setIsStarred] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [subtasks, setSubtasks] = useState<{ id?: string; title: string; isCompleted: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setCategoryId(taskToEdit.categoryId || "");
      setDueDate(taskToEdit.dueDate || "");
      setDueTime(taskToEdit.dueTime || "");
      setPriority(taskToEdit.priority || "medium");
      setIsStarred(Boolean(taskToEdit.isStarred));
      setHasReminder(Boolean(taskToEdit.hasReminder));
      setSubtasks(
        taskToEdit.subtasks?.map((s) => ({
          id: s.id,
          title: s.title,
          isCompleted: s.isCompleted,
        })) || []
      );
    } else {
      // Default new task
      setTitle("");
      setDescription("");
      setCategoryId(initialCategory && initialCategory !== "all" ? initialCategory : categories[0]?.id || "");
      setDueDate(todayStr);
      setDueTime("");
      setPriority("medium");
      setIsStarred(false);
      setHasReminder(false);
      setSubtasks([]);
    }
  }, [taskToEdit, isOpen, categories, initialCategory]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskInput.trim(), isCompleted: false }]);
    setNewSubtaskInput("");
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (preset: (typeof BEGINNER_PRESETS)[0]) => {
    setTitle(preset.title);
    setPriority(preset.priority);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...(taskToEdit ? { id: taskToEdit.id } : {}),
        title: title.trim(),
        description: description.trim() || null,
        categoryId: categoryId || null,
        dueDate: dueDate || null,
        dueTime: dueTime || null,
        priority,
        isStarred,
        hasReminder,
        subtasks,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {taskToEdit ? "Edit Task" : "New Android Task"}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {taskToEdit ? "Update your task details below" : "Add a simple task for your day"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick presets for beginners when creating a new task */}
          {!taskToEdit && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Beginner Quick Presets</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BEGINNER_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Buy groceries, Call mechanic..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Notes & Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add reminders, shopping items, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "ring-2 ring-offset-1 text-white"
                        : "bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                    }`}
                    style={{
                      backgroundColor: isSelected ? c.color : undefined,
                      borderColor: isSelected ? c.color : undefined,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? "#ffffff" : c.color }}
                    />
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Due Date & Time
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDueDate(todayStr)}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  dueDate === todayStr
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(tomorrowStr)}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  dueDate === tomorrowStr
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDate("")}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors ${
                  !dueDate
                    ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                No Date
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Priority & Star */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Priority
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-semibold capitalize rounded-xl border transition-all ${
                        isSelected
                          ? p === "high"
                            ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                            : p === "medium"
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-slate-600 text-white border-slate-600 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p === "high" && "🔥 "}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Important / Starred
              </label>
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  isStarred
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <Star className={`w-4 h-4 ${isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                <span>{isStarred ? "Marked as Important" : "Mark as Important"}</span>
              </button>
            </div>
          </div>

          {/* Subtasks / Checklist builder */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
              Checklist / Subtasks
            </label>

            {subtasks.length > 0 && (
              <div className="space-y-2 mb-3">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 text-sm"
                  >
                    <span className="truncate text-neutral-800 dark:text-neutral-200">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-neutral-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add item (e.g. 2% Milk, Whole bread)..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : taskToEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
