import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { AUTH_COOKIE, createToken, hashPassword } from "@/lib/auth";
import { seedTasksForUser } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    const { email, username, name, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split("@")[0]).trim().toLowerCase();

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.username, cleanUsername)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 400 });
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);

    await db.insert(users).values({
      id: userId,
      email: cleanEmail,
      username: cleanUsername,
      name: name.trim(),
      passwordHash,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      theme: "system",
      accentColor: "emerald",
      soundEnabled: true,
      hapticEnabled: true,
      autoSaveLocal: true,
    });

    // Seed initial beginner tasks for the new user
    await seedTasksForUser(userId);

    const token = createToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        username: cleanUsername,
        name: name.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        theme: "system",
        accentColor: "emerald",
        soundEnabled: true,
        hapticEnabled: true,
        autoSaveLocal: true,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
