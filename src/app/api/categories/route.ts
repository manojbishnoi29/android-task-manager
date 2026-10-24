import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    categories: [],
    offline: true,
    message: "Categories are stored locally on this device.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color = "#10b981", icon = "tag" } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      color,
      icon,
      isDefault: false,
      taskCount: 0,
      completedCount: 0,
    };

    return NextResponse.json({
      success: false,
      offline: true,
      message: "Please manage categories through the app's local storage.",
      category: newCategory,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}