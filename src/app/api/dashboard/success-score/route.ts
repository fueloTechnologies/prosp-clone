import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    include: { contacts: true, steps: true },
  });

  const scores = campaigns.map((c) => {
    const connections = c.contacts.length;
    const conversations = Math.floor(connections * 0.3);
    const replies = Math.floor(connections * 0.2);
    const meetings = Math.floor(connections * 0.1);
    const score =
      connections * 0.4 + conversations * 0.3 + replies * 0.2 + meetings * 0.1;
    return { id: c.id, name: c.name, score: Math.round(score) };
  });

  return NextResponse.json(scores);
}
