import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const connections = await prisma.contact.count({ where: { userId } });
    const conversations = await prisma.conversation.count({
      where: { userId },
    });
    const engagements = await prisma.campaign.count({ where: { userId } });
    const inmails = await prisma.message.count({ where: { userId } });

    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: { tags: true },
    });
    const uniqueTags = new Set(contacts.flatMap((c) => c.tags));
    const tags = uniqueTags.size;

    return NextResponse.json({
      connections,
      conversations,
      engagements,
      inmails,
      tags,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
