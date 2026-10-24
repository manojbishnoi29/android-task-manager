import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { tasks, subtasks, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const taskList = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .limit(1);

    if (taskList.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = taskList[0];
    const taskSubtasks = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, task.id));

    let category = null;
    if (task.categoryId) {
      const cat = await db.select().from(categories).where(eq(categories.id, task.categoryId)).limit(1);
      if (cat.length > 0) category = cat[0];
    }

    return NextResponse.json({
      task: {
        ...task,
        category,
        subtasks: taskSubtasks.sort((a, b) => a.position - b.position),
      },
    });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const {
      title,
      description,
      categoryId,
      dueDate,
      dueTime,
      priority,
      isStarred,
      hasReminder,
      reminderTime,
      isCompleted,
      subtasks: newSubtasks,
    } = body;

    const updateData: Partial<typeof tasks.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (dueTime !== undefined) updateData.dueTime = dueTime || null;
    if (priority !== undefined) updateData.priority = priority;
    if (isStarred !== undefined) updateData.isStarred = Boolean(isStarred);
    if (hasReminder !== undefined) updateData.hasReminder = Boolean(hasReminder);
    if (reminderTime !== undefined) updateData.reminderTime = reminderTime || null;
    if (isCompleted !== undefined) {
      updateData.isCompleted = Boolean(isCompleted);
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    await db.update(tasks).set(updateData).where(eq(tasks.id, id));

    // If subtasks array is passed, sync them
    if (Array.isArray(newSubtasks)) {
      await db.delete(subtasks).where(eq(subtasks.taskId, id));

      const subtaskInserts = newSubtasks
        .filter((st: string | { title: string }) => {
          if (typeof st === "string") return st.trim().length > 0;
          return st && st.title && st.title.trim().length > 0;
        })
        .map((st: string | { id?: string; title: string; isCompleted?: boolean }, index: number) => ({
          id: typeof st === "object" && st.id ? st.id : `sub-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          taskId: id,
          title: typeof st === "string" ? st.trim() : st.title.trim(),
          isCompleted: typeof st === "object" && Boolean(st.isCompleted),
          position: index,
        }));

      if (subtaskInserts.length > 0) {
        await db.insert(subtasks).values(subtaskInserts);
      }
    }

    const updatedTask = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    const updatedSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, id));
    let category = null;
    if (updatedTask[0].categoryId) {
      const cat = await db.select().from(categories).where(eq(categories.id, updatedTask[0].categoryId)).limit(1);
      if (cat.length > 0) category = cat[0];
    }

    return NextResponse.json({
      success: true,
      task: {
        ...updatedTask[0],
        category,
        subtasks: updatedSubtasks.sort((a, b) => a.position - b.position),
      },
    });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Subtasks cascade on delete
    await db.delete(tasks).where(eq(tasks.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
