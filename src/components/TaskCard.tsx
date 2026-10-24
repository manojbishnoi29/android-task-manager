"use client";

import React, { useState } from "react";
import { Task, Subtask } from "@/lib/types";
import { useTheme } from "./ThemeContext";
import { playTaskDoneSound, playTaskUncheckSound, playDeleteSound, triggerHaptic } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  Check,
  Calendar,
  Clock,
  Star,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  Plus,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onToggleStar: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtask: Subtask) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
}: TaskCardProps) {
  const { soundEnabled, hapticEnabled, accentClasses } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      playTaskDoneSound(soundEnabled);
      triggerHaptic(hapticEnabled);
      // Confetti burst for high priority or milestone tasks
      if (task.priority === "high" || Math.random() > 0.6) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.75 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
        });
      }
    } else {
      playTaskUncheckSound(soundEnabled);
      triggerHaptic(hapticEnabled);
    }
    onToggleComplete(task);
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(hapticEnabled);
    onToggleStar(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    playDeleteSound(soundEnabled);
    triggerHaptic(hapticEnabled);
    onDelete(task);
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  // Format due date indicator
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const isOverdue = dateStr < today && !task.isCompleted;
    const isToday = dateStr === today;
    const isTomorrow = dateStr === tomorrowStr;

    let text = dateStr;
    if (isToday) text = "Today";
    else if (isTomorrow) text = "Tomorrow";
    else {
      // Month and Day e.g. "Apr 2"
      try {
        const parts = dateStr.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        text = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {
        text = dateStr;
      }
    }

    return { text, isOverdue, isToday };
  };

  const dueInfo = formatDueDate(task.dueDate);

  // Priority color styling
  const priorityStyles = {
    high: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900/40",
    medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/40",
    low: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
        task.isCompleted
          ? "bg-neutral-50/80 dark:bg-neutral-900/40 border-neutral-200/70 dark:border-neutral-800 opacity-80"
          : "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Android style Checkbox */}
          <button
            onClick={handleCheck}
            aria-label={task.isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
            className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
              task.isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                : "border-neutral-300 dark:border-neutral-600 hover:border-emerald-500 dark:hover:border-emerald-400 bg-neutral-50 dark:bg-neutral-800"
            }`}
          >
            {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          {/* Task Main Content */}
          <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`font-semibold text-base sm:text-lg leading-snug cursor-pointer select-none transition-colors ${
                  task.isCompleted
                    ? "line-through text-neutral-400 dark:text-neutral-500"
                    : "text-neutral-900 dark:text-neutral-100"
                }`}
              >
                {task.title}
              </h3>

              {/* Star toggle */}
              <button
                onClick={handleStar}
                aria-label={task.isStarred ? "Unstar task" : "Star task"}
                className="p-1 rounded-full text-neutral-300 dark:text-neutral-600 hover:text-amber-400 dark:hover:text-amber-400 transition-colors shrink-0"
              >
                <Star
                  className={`w-5 h-5 ${
                    task.isStarred ? "text-amber-400 fill-amber-400" : ""
                  }`}
                />
              </button>
            </div>

            {/* Task Description / Notes */}
            {task.description && (
              <p
                className={`mt-1 text-sm line-clamp-2 leading-relaxed ${
                  task.isCompleted
                    ? "text-neutral-400 dark:text-neutral-500 line-through"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Badges / Meta Info Row */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {/* Category Pill */}
              {task.category && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${task.category.color}15`,
                    color: task.category.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: task.category.color }}
                  />
                  <span>{task.category.name}</span>
                </span>
              )}

              {/* Priority Pill */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border text-[11px] uppercase tracking-wider ${
                  priorityStyles[task.priority] || priorityStyles.medium
                }`}
              >
                {task.priority === "high" && "🔥 "}
                {task.priority}
              </span>

              {/* Due Date Indicator */}
              {dueInfo && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-xs ${
                    dueInfo.isOverdue
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : dueInfo.isToday
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {dueInfo.isOverdue ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{dueInfo.text}</span>
                  {task.dueTime && (
                    <span className="flex items-center gap-0.5 ml-1 text-[11px] opacity-80">
                      <Clock className="w-3 h-3" />
                      {task.dueTime}
                    </span>
                  )}
                </span>
              )}

              {/* Subtasks Progress Chip */}
              {totalSubtasks > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-xs transition-colors ${
                    completedSubtasks === totalSubtasks
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  <span>
                    {completedSubtasks}/{totalSubtasks} items
                  </span>
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              title="Edit Task"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Task"
              className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Subtask Checklist (Great for Beginner grocers and to-doers!) */}
        {expanded && totalSubtasks > 0 && (
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2 pl-9">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Checklist Items
            </p>
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={() => onToggleSubtask(task.id, st)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer select-none transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    st.isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`}
                >
                  {st.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span
                  className={`text-sm ${
                    st.isCompleted
                      ? "line-through text-neutral-400 dark:text-neutral-500"
                      : "text-neutral-700 dark:text-neutral-200"
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}

            {/* Quick add subtask inline */}
            {isAddingSubtask ? (
              <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="New item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  autoFocus
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSubtask(false)}
                  className="px-2 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add checklist item</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
