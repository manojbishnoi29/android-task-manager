import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    return NextResponse.json({
      success: false,
      offline: true,
      message: "Categories are managed locally on this device.",
      id,
      received: body,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Delete categories from the app instead.",
    id,
  });
}