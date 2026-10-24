import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { theme, accentColor, soundEnabled, hapticEnabled, autoSaveLocal, name } = body;

    const updateData: Partial<typeof users.$inferInsert> = {};
    if (theme !== undefined) updateData.theme = theme;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (soundEnabled !== undefined) updateData.soundEnabled = Boolean(soundEnabled);
    if (hapticEnabled !== undefined) updateData.hapticEnabled = Boolean(hapticEnabled);
    if (autoSaveLocal !== undefined) updateData.autoSaveLocal = Boolean(autoSaveLocal);
    if (name !== undefined && name.trim()) updateData.name = name.trim();

    await db.update(users).set(updateData).where(eq(users.id, user.id));

    const updated = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    const { passwordHash: _, ...safeUser } = updated[0];

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
