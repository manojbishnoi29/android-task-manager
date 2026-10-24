import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoData } from "@/lib/seed";

export async function GET() {
  try {
    let user = await getCurrentUser();

    if (!user) {
      await ensureDemoData();
      user = await getCurrentUser();
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Don't send password hash
    const { passwordHash: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
