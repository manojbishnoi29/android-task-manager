"use client";

import React from "react";
import { Category, Task } from "@/lib/types";
import { Plus, Edit2, Trash2, FolderTree, CheckCircle2 } from "lucide-react";

interface CategoriesViewProps {
  categories: Category[];
  tasks: Task[];
  onSelectCategory: (categoryId: string) => void;
  onOpenNewCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (cat: Category) => void;
}

export function CategoriesView({
  categories,
  tasks,
  onSelectCategory,
  onOpenNewCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesViewProps) {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Lists & Categories
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize tasks by area of your life
          </p>
        </div>
        <button
          onClick={onOpenNewCategory}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New List</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map((cat) => {
          const catTasks = tasks.filter((t) => t.categoryId === cat.id);
          const doneTasks = catTasks.filter((t) => t.isCompleted);
          const progress = catTasks.length > 0 ? Math.round((doneTasks.length / catTasks.length) * 100) : 0;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEditCategory(cat)}
                      title="Edit Category"
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        title="Delete Category"
                        className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {catTasks.length === 0
                    ? "No tasks yet"
                    : `${doneTasks.length} of ${catTasks.length} tasks completed`}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-2">
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
