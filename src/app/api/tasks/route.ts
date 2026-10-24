import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoData } from "@/lib/seed";
import { db } from "@/db";
import { tasks, subtasks, categories } from "@/db/schema";
import { eq, desc, asc, and, ilike, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      const demoId = await ensureDemoData();
      user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const categoryId = searchParams.get("categoryId");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Query tasks
    let query = db.select().from(tasks).where(eq(tasks.userId, user.id));

    const userTasks = await query;
    const userCategories = await db.select().from(categories).where(eq(categories.userId, user.id));
    const userSubtasks = await db.select().from(subtasks);

    const categoryMap = new Map(userCategories.map((c) => [c.id, c]));
    const subtaskMap = new Map<string, typeof userSubtasks>();

    userSubtasks.forEach((st) => {
      const current = subtaskMap.get(st.taskId) || [];
      current.push(st);
      subtaskMap.set(st.taskId, current);
    });

    const todayStr = new Date().toISOString().split("T")[0];

    // Combine and enrich tasks
    let enriched = userTasks.map((t) => ({
      ...t,
      category: t.categoryId ? categoryMap.get(t.categoryId) || null : null,
      subtasks: (subtaskMap.get(t.id) || []).sort((a, b) => a.position - b.position),
    }));

    // Apply filters
    if (filter === "today") {
      enriched = enriched.filter((t) => t.dueDate === todayStr);
    } else if (filter === "upcoming") {
      enriched = enriched.filter((t) => !t.isCompleted && (!t.dueDate || t.dueDate > todayStr));
    } else if (filter === "completed") {
      enriched = enriched.filter((t) => t.isCompleted);
    } else if (filter === "starred") {
      enriched = enriched.filter((t) => t.isStarred);
    }

    if (categoryId && categoryId !== "all") {
      enriched = enriched.filter((t) => t.categoryId === categoryId);
    }

    if (priority && priority !== "all") {
      enriched = enriched.filter((t) => t.priority === priority);
    }

    if (search && search.trim() !== "") {
      const queryLower = search.trim().toLowerCase();
      enriched = enriched.filter(
        (t) =>
          t.title.toLowerCase().includes(queryLower) ||
          (t.description && t.description.toLowerCase().includes(queryLower)) ||
          t.subtasks.some((st) => st.title.toLowerCase().includes(queryLower))
      );
    }

    // Sort
    enriched.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const comp = a.dueDate.localeCompare(b.dueDate);
        return sortOrder === "asc" ? comp : -comp;
      } else if (sortBy === "priority") {
        const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const wA = priorityWeight[a.priority] || 0;
        const wB = priorityWeight[b.priority] || 0;
        return sortOrder === "asc" ? wA - wB : wB - wA;
      } else if (sortBy === "title") {
        const comp = a.title.localeCompare(b.title);
        return sortOrder === "asc" ? comp : -comp;
      } else {
        // createdAt
        const tA = new Date(a.createdAt).getTime();
        const tB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? tA - tB : tB - tA;
      }
    });

    return NextResponse.json({ tasks: enriched });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let user = await getCurrentUser();
    if (!user) {
      await ensureDemoData();
      user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      dueDate,
      dueTime,
      priority = "medium",
      isStarred = false,
      hasReminder = false,
      reminderTime,
      subtasks: rawSubtasks = [],
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(tasks).values({
      id: taskId,
      userId: user.id,
      categoryId: categoryId || null,
      title: title.trim(),
      description: description ? description.trim() : null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority: priority || "medium",
      isStarred: Boolean(isStarred),
      hasReminder: Boolean(hasReminder),
      reminderTime: reminderTime || null,
      isCompleted: false,
    });

    // Insert subtasks if any
    if (Array.isArray(rawSubtasks) && rawSubtasks.length > 0) {
      const subtaskValues = rawSubtasks
        .filter((s: string | { title: string }) => {
          if (typeof s === "string") return s.trim().length > 0;
          return s && s.title && s.title.trim().length > 0;
        })
        .map((s: string | { title: string; isCompleted?: boolean }, index: number) => ({
          id: `sub-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
          taskId,
          title: typeof s === "string" ? s.trim() : s.title.trim(),
          isCompleted: typeof s === "object" && s.isCompleted ? true : false,
          position: index,
        }));

      if (subtaskValues.length > 0) {
        await db.insert(subtasks).values(subtaskValues);
      }
    }

    // Fetch the newly created full task
    const createdTask = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    const createdSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
    let cat = null;
    if (categoryId) {
      const catResult = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
      if (catResult.length > 0) cat = catResult[0];
    }

    return NextResponse.json({
      success: true,
      task: {
        ...createdTask[0],
        category: cat,
        subtasks: createdSubtasks.sort((a, b) => a.position - b.position),
      },
    });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
