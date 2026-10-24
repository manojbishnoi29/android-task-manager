import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    offline: true,
  });

  response.cookies.set("android_task_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}