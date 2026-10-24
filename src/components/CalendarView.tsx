"use client";

import React from "react";
import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Subtask } from "@/lib/types";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onToggleStar: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtask: Subtask) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onOpenNewTask: () => void;
}

export function CalendarView({
  tasks,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onOpenNewTask,
}: CalendarViewProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && !t.isCompleted);
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrowStr);
  const futureTasks = tasks.filter((t) => t.dueDate && t.dueDate > tomorrowStr);
  const unscheduled = tasks.filter((t) => !t.dueDate);

  const sections = [
    { title: "Overdue", list: overdue, badge: "Needs Attention", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60" },
    { title: "Today", list: todayTasks, badge: todayStr, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60" },
    { title: "Tomorrow", list: tomorrowTasks, badge: tomorrowStr, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/60" },
    { title: "Upcoming Later", list: futureTasks, badge: `${futureTasks.length} tasks`, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/60" },
    { title: "No Due Date", list: unscheduled, badge: "Someday", color: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800" },
  ].filter((sec) => sec.list.length > 0);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Schedule & Timeline
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your tasks mapped out chronologically
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8">
          <CalendarIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-base">
            No scheduled tasks
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Add dates to your tasks to see them organized on your schedule.
          </p>
          <button
            onClick={onOpenNewTask}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
          >
            Create Task
          </button>
        </div>
      ) : (
        sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                  {section.title}
                </span>
                <span className="text-xs text-neutral-400">({section.list.length})</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${section.color}`}>
                {section.badge}
              </span>
            </div>

            <div className="space-y-2.5">
              {section.list.map((task) => (
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
          </div>
        ))
      )}
    </div>
  );
}
