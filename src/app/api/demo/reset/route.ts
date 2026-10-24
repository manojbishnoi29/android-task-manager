import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { seedTasksForUser } from "@/lib/seed";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await seedTasksForUser(user.id);

    return NextResponse.json({ success: true, message: "Tasks reset to beginner demo data successfully" });
  } catch (error) {
    console.error("Reset demo error:", error);
    return NextResponse.json({ error: "Failed to reset tasks" }, { status: 500 });
  }
}
