import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Tasks are managed locally on this device.",
    id,
  });
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Update tasks through the app's local storage.",
    id,
  });
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Delete tasks through the app's local storage.",
    id,
  });
}