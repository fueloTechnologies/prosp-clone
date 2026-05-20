import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const conversations = await prisma.conversation.findMany({
      where: { userId, createdAt: { gte: startDate } },
    });

    const timeline: Record<string, number> = {};
    conversations.forEach((conv) => {
      const date = conv.createdAt.toISOString().split("T")[0];
      if (!timeline[date]) timeline[date] = 0;
      timeline[date]++;
    });

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 },
    );
  }
}
