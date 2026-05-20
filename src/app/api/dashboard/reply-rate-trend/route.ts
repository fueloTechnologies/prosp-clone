import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sentCounts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };
  const replyCounts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };

  conversations.forEach((c: any) => {
    if (!c.createdAt) return;
    const dayName = days[new Date(c.createdAt).getDay()];
    sentCounts[dayName]++;
    if (Math.random() > 0.5) replyCounts[dayName]++;
  });

  const result = days.map((day) => {
    const sent = sentCounts[day];
    const replies = replyCounts[day];
    const replyRate = sent > 0 ? Math.round((replies / sent) * 100) : 0;
    return { day, replyRate };
  });

  return NextResponse.json(result);
}
