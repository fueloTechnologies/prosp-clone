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

    const campaigns = await prisma.campaign.findMany({ where: { userId } });

    const leaderboard = campaigns
      .map((c) => ({
        id: c.id,
        name: c.name,
        connections: c.totalContacts || 0,
      }))
      .sort((a, b) => b.connections - a.connections);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json([]);
  }
}
