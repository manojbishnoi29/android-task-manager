import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { tasks, subtasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST: Add a new subtask to task
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id))).limit(1);
    if (task.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const existingSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, id));

    const newSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId: id,
      title: title.trim(),
      isCompleted: false,
      position: existingSubtasks.length,
    };

    await db.insert(subtasks).values(newSubtask);

    return NextResponse.json({ success: true, subtask: newSubtask });
  } catch (error) {
    console.error("Add subtask error:", error);
    return NextResponse.json({ error: "Failed to add subtask" }, { status: 500 });
  }
}

// PUT: Toggle subtask completion
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { subtaskId, isCompleted, title } = await request.json();

    const task = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id))).limit(1);
    if (task.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updateData: Partial<typeof subtasks.$inferInsert> = {};
    if (isCompleted !== undefined) updateData.isCompleted = Boolean(isCompleted);
    if (title !== undefined) updateData.title = title.trim();

    await db.update(subtasks).set(updateData).where(eq(subtasks.id, subtaskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update subtask error:", error);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

// DELETE: Delete a subtask
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const subtaskId = searchParams.get("subtaskId");

    if (!subtaskId) {
      return NextResponse.json({ error: "subtaskId is required" }, { status: 400 });
    }

    const task = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id))).limit(1);
    if (task.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subtask error:", error);
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}
