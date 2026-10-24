import { db } from "@/db";
import { users, categories, tasks, subtasks } from "@/db/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

export async function ensureDemoData() {
  const existingUser = await db.select().from(users).where(eq(users.email, "alex@androidtask.com")).limit(1);

  let userId: string;

  if (existingUser.length === 0) {
    userId = "demo-alex-user";
    await db.insert(users).values({
      id: userId,
      email: "alex@androidtask.com",
      username: "alex_starter",
      name: "Alex Morgan",
      passwordHash: hashPassword("beginner123"),
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      theme: "system",
      accentColor: "emerald",
      soundEnabled: true,
      hapticEnabled: true,
      autoSaveLocal: true,
    });
    await seedTasksForUser(userId);
  } else {
    userId = existingUser[0].id;
    // Check if tasks exist
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId)).limit(1);
    if (userTasks.length === 0) {
      await seedTasksForUser(userId);
    }
  }

  return userId;
}

export async function seedTasksForUser(userId: string) {
  // Clear any existing tasks/categories for this user
  await db.delete(tasks).where(eq(tasks.userId, userId));
  await db.delete(categories).where(eq(categories.userId, userId));

  // Today's date and relative dates
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split("T")[0];

  const todayStr = formatYMD(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatYMD(tomorrow);

  const inTwoDays = new Date(today);
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const inTwoDaysStr = formatYMD(inTwoDays);

  const inFourDays = new Date(today);
  inFourDays.setDate(inFourDays.getDate() + 4);
  const inFourDaysStr = formatYMD(inFourDays);

  // 1. Create categories
  const catGroceriesId = `cat-groceries-${userId}`;
  const catPersonalId = `cat-personal-${userId}`;
  const catWorkId = `cat-work-${userId}`;
  const catStudyId = `cat-study-${userId}`;
  const catHealthId = `cat-health-${userId}`;

  await db.insert(categories).values([
    {
      id: catPersonalId,
      userId,
      name: "Personal",
      color: "#3b82f6", // blue
      icon: "user",
      isDefault: true,
    },
    {
      id: catGroceriesId,
      userId,
      name: "Groceries & Home",
      color: "#10b981", // emerald
      icon: "shopping-cart",
      isDefault: false,
    },
    {
      id: catWorkId,
      userId,
      name: "Work & Projects",
      color: "#f59e0b", // amber
      icon: "briefcase",
      isDefault: false,
    },
    {
      id: catStudyId,
      userId,
      name: "Study & Skills",
      color: "#8b5cf6", // purple
      icon: "book-open",
      isDefault: false,
    },
    {
      id: catHealthId,
      userId,
      name: "Health & Habit",
      color: "#f43f5e", // rose
      icon: "heart-pulse",
      isDefault: false,
    },
  ]);

  // 2. Create tasks
  const t1Id = `task-1-${userId}`;
  const t2Id = `task-2-${userId}`;
  const t3Id = `task-3-${userId}`;
  const t4Id = `task-4-${userId}`;
  const t5Id = `task-5-${userId}`;
  const t6Id = `task-6-${userId}`;
  const t7Id = `task-7-${userId}`;
  const t8Id = `task-8-${userId}`;

  await db.insert(tasks).values([
    {
      id: t1Id,
      userId,
      categoryId: catGroceriesId,
      title: "Pick up fresh groceries & almond milk",
      description: "Don't forget the reusable tote bags in the car trunk!",
      isCompleted: false,
      dueDate: todayStr,
      dueTime: "17:30",
      priority: "high",
      isStarred: true,
      hasReminder: true,
      reminderTime: "17:00",
    },
    {
      id: t2Id,
      userId,
      categoryId: catPersonalId,
      title: "Call Mom for Sunday dinner plans",
      description: "Ask if she wants me to bring dessert or homemade bread.",
      isCompleted: false,
      dueDate: todayStr,
      dueTime: "19:00",
      priority: "high",
      isStarred: true,
      hasReminder: true,
      reminderTime: "18:45",
    },
    {
      id: t3Id,
      userId,
      categoryId: catStudyId,
      title: "15 min Duolingo Spanish lesson",
      description: "Keep the 14-day daily streak alive! 🔥 Section 3 lesson 4.",
      isCompleted: false,
      dueDate: todayStr,
      dueTime: "13:00",
      priority: "medium",
      isStarred: false,
      hasReminder: false,
    },
    {
      id: t4Id,
      userId,
      categoryId: catPersonalId,
      title: "Water indoor snake plant & monstera",
      description: "Checked soil moisture; misted leaves lightly.",
      isCompleted: true,
      completedAt: new Date(),
      dueDate: todayStr,
      dueTime: "09:00",
      priority: "low",
      isStarred: false,
      hasReminder: false,
    },
    {
      id: t5Id,
      userId,
      categoryId: catWorkId,
      title: "Prepare quarterly team sprint retro slides",
      description: "Keep it under 10 slides. Highlight top 3 product wins and team velocity.",
      isCompleted: false,
      dueDate: tomorrowStr,
      dueTime: "11:00",
      priority: "high",
      isStarred: true,
      hasReminder: true,
      reminderTime: "10:00",
    },
    {
      id: t6Id,
      userId,
      categoryId: catHealthId,
      title: "30-minute evening brisk walk in the park",
      description: "Aim for 4,000 steps before dinner to hit the 10k daily step goal.",
      isCompleted: false,
      dueDate: todayStr,
      dueTime: "18:30",
      priority: "medium",
      isStarred: false,
      hasReminder: false,
    },
    {
      id: t7Id,
      userId,
      categoryId: catPersonalId,
      title: "Review and cancel unused Google Play subscriptions",
      description: "Check cloud backup and streaming services we don't watch anymore.",
      isCompleted: false,
      dueDate: inTwoDaysStr,
      dueTime: "16:00",
      priority: "medium",
      isStarred: false,
      hasReminder: false,
    },
    {
      id: t8Id,
      userId,
      categoryId: catGroceriesId,
      title: "Order replacement HEPA air filters for bedroom",
      description: "Size: 20x25x1 MERV 11 filter pack.",
      isCompleted: false,
      dueDate: inFourDaysStr,
      dueTime: "12:00",
      priority: "low",
      isStarred: false,
      hasReminder: false,
    },
  ]);

  // 3. Subtasks
  await db.insert(subtasks).values([
    // Subtasks for groceries
    {
      id: `sub-1-${t1Id}`,
      taskId: t1Id,
      title: "Unsweetened almond milk (vanilla)",
      isCompleted: true,
      position: 0,
    },
    {
      id: `sub-2-${t1Id}`,
      taskId: t1Id,
      title: "Organic ripe bananas & honeycrisp apples",
      isCompleted: false,
      position: 1,
    },
    {
      id: `sub-3-${t1Id}`,
      taskId: t1Id,
      title: "Whole wheat artisan sourdough",
      isCompleted: false,
      position: 2,
    },
    {
      id: `sub-4-${t1Id}`,
      taskId: t1Id,
      title: "Greek yogurt 0% (large tub)",
      isCompleted: false,
      position: 3,
    },
    // Subtasks for Work Slides
    {
      id: `sub-5-${t5Id}`,
      taskId: t5Id,
      title: "Outline key milestone achievements",
      isCompleted: true,
      position: 0,
    },
    {
      id: `sub-6-${t5Id}`,
      taskId: t5Id,
      title: "Pull release metric numbers from dashboard",
      isCompleted: false,
      position: 1,
    },
    {
      id: `sub-7-${t5Id}`,
      taskId: t5Id,
      title: "Review draft with Product Lead",
      isCompleted: false,
      position: 2,
    },
  ]);
}
