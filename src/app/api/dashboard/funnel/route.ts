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

    const connections = await prisma.contact.count({ where: { userId } });
    const conversations = await prisma.conversation.count({
      where: { userId },
    });
    const replies = await prisma.message.count({ where: { userId } });
    const meetings = 0;

    return NextResponse.json([
      { stage: "Connections", value: connections },
      { stage: "Conversations", value: conversations },
      { stage: "Replies", value: replies },
      { stage: "Meetings", value: meetings },
    ]);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}
