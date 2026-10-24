import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoData } from "@/lib/seed";
import { db } from "@/db";
import { categories, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    let user = await getCurrentUser();
    if (!user) {
      await ensureDemoData();
      user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, user.id));

    // Also get task count per category
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id));

    const enriched = userCategories.map((cat) => {
      const catTasks = userTasks.filter((t) => t.categoryId === cat.id);
      return {
        ...cat,
        taskCount: catTasks.length,
        completedCount: catTasks.filter((t) => t.isCompleted).length,
      };
    });

    return NextResponse.json({ categories: enriched });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, color = "#10b981", icon = "tag" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const categoryId = `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newCategory = {
      id: categoryId,
      userId: user.id,
      name: name.trim(),
      color: color || "#10b981",
      icon: icon || "tag",
      isDefault: false,
    };

    await db.insert(categories).values(newCategory);

    return NextResponse.json({ success: true, category: { ...newCategory, taskCount: 0, completedCount: 0 } });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
