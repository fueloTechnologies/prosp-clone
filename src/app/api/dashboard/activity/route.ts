import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const contacts = await prisma.contact.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const activities = [
    ...contacts.map((c) => ({
      type: "connection",
      text: `Connected with ${c.firstName} ${c.lastName}`,
      date: c.createdAt,
    })),
    ...conversations.map((conv) => ({
      type: "conversation",
      text: `Conversation started`,
      date: conv.createdAt,
    })),
  ];

  activities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return NextResponse.json(activities.slice(0, 10));
}
