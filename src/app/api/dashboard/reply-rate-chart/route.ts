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

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const campaigns = await prisma.campaign.findMany({ where: { userId } });

    let totalSent = 0,
      totalReplies = 0;
    campaigns.forEach((c) => {
      totalSent += c.sentCount || 0;
      totalReplies += c.replyCount || 0;
    });

    const replyRate =
      totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0;
    const data = days.map((day) => ({ day, rate: replyRate }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reply rate chart error:", error);
    return NextResponse.json([]);
  }
}
