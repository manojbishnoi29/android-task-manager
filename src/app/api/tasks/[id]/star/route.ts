import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteParams
) {
  const { id } = await params;

  return NextResponse.json({
    success: false,
    offline: true,
    message: "Star status is managed locally on this device.",
    id,
  });
}