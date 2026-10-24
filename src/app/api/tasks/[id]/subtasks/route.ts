import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  try {
    const body = await request.json();

    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: false,
      offline: true,
      message: "Subtasks are managed locally on this device.",
      taskId: id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Update subtasks through the app's local storage.",
    taskId: id,
  });
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const subtaskId = searchParams.get("subtaskId");

  if (!subtaskId) {
    return NextResponse.json(
      { success: false, error: "subtaskId is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Delete subtasks through the app's local storage.",
    taskId: id,
    subtaskId,
  });
}