import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const messages = await prisma.message.findMany({ where: { userId } });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };

  messages.forEach((msg: any) => {
    if (!msg.createdAt) return;
    const dayName = days[new Date(msg.createdAt).getDay()];
    counts[dayName]++;
  });

  const result = Object.keys(counts).map((day) => ({
    day,
    count: counts[day],
  }));
  return NextResponse.json(result);
}
