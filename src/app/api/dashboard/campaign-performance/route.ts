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

    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    });

    const results = [];

    for (const campaign of campaigns) {
      const connections = await prisma.contact.count({ where: { userId } });
      const conversations = await prisma.conversation.count({
        where: { userId },
      });
      const replyRate =
        connections > 0 ? Math.round((conversations / connections) * 100) : 0;

      results.push({
        campaign: campaign.name,
        connections,
        conversations,
        replyRate,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Campaign performance error:", error);
    return NextResponse.json([]);
  }
}
