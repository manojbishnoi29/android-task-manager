import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const newStarred = !existing[0].isStarred;
    await db
      .update(tasks)
      .set({
        isStarred: newStarred,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    return NextResponse.json({ success: true, isStarred: newStarred });
  } catch (error) {
    console.error("Star task error:", error);
    return NextResponse.json({ error: "Failed to toggle star" }, { status: 500 });
  }
}
