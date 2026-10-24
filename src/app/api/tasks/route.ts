import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    tasks: [],
    offline: true,
    message: "Tasks are managed locally on this device.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Task title is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: false,
      offline: true,
      message: "Please manage tasks through the app's local storage.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}