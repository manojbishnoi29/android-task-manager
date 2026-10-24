import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { categories, tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, color, icon } = body;

    const existing = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updateData: Partial<typeof categories.$inferInsert> = {};
    if (name) updateData.name = name.trim();
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;

    await db.update(categories).set(updateData).where(eq(categories.id, id));

    const updated = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    return NextResponse.json({ success: true, category: updated[0] });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Set categoryId to null on associated tasks
    await db.update(tasks).set({ categoryId: null }).where(eq(tasks.categoryId, id));
    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
