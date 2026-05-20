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
      include: { contacts: true },
    });

    const alerts: string[] = [];
    campaigns.forEach((c) => {
      if (c.contacts.length === 0) alerts.push(`${c.name} has no contacts`);
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Campaign alerts error:", error);
    return NextResponse.json([]);
  }
}
