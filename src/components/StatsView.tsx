"use client";

import React from "react";
import { Task, Category } from "@/lib/types";
import { CheckCircle2, TrendingUp, Flame, Calendar, Award, Check } from "lucide-react";

interface StatsViewProps {
  tasks: Task[];
  categories: Category[];
}

export function StatsView({ tasks, categories }: StatsViewProps) {
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const total = tasks.length;
  const completionPercentage = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.isCompleted);

  // Group by category
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const catDone = catTasks.filter((t) => t.isCompleted);
    return {
      name: cat.name,
      color: cat.color,
      total: catTasks.length,
      done: catDone.length,
      rate: catTasks.length > 0 ? Math.round((catDone.length / catTasks.length) * 100) : 0,
    };
  });

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Productivity Stats
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Track your daily momentum and task progress
        </p>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Streak card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Daily Streak</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            5 Days
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">Keep it up! 🔥</p>
        </div>

        {/* Completion Rate card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/50">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Done Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {completionPercentage}%
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
            {completedTasks.length} of {total} tasks
          </p>
        </div>

        {/* Today's Tasks */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Focus</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
            {todayCompleted.length}/{todayTasks.length}
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
            {todayTasks.length - todayCompleted.length} pending today
          </p>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Overall Completion
            </h3>
            <p className="text-xs text-neutral-500">All registered tasks in your list</p>
          </div>
          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
            {completionPercentage}%
          </span>
        </div>

        <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
          <span>{completedTasks.length} completed</span>
          <span>{pendingTasks.length} in progress</span>
        </div>
      </div>

      {/* Tasks by Category */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
          Progress by Category
        </h3>

        <div className="space-y-3">
          {categoryStats.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">{c.name}</span>
                </div>
                <span className="text-neutral-500">
                  {c.done}/{c.total} done ({c.rate}%)
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${c.rate}%`, backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Tip for Beginners */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
        <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Beginner Habit Tip</p>
          <p className="mt-0.5 leading-relaxed">
            Completing just 3 small tasks before noon builds early momentum for the rest of your day. Keep
            your tasks small and actionable!
          </p>
        </div>
      </div>
    </div>
  );
}
