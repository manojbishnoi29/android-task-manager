import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      offline: true,
      message: "Login is disabled in offline mode",
    },
    { status: 200 }
  );
}