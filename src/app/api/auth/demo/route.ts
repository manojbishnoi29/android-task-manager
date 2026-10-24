import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, createToken } from "@/lib/auth";
import { ensureDemoData } from "@/lib/seed";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const userId = await ensureDemoData();
    const token = createToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const { passwordHash: _, ...safeUser } = user[0];

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Failed to login as demo user" }, { status: 500 });
  }
}
