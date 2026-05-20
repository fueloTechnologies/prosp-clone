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

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: "desc" },
      include: {
        contact: true,
        messages: { orderBy: { sentAt: "asc" } },
      },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Inbox fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load inbox" },
      { status: 500 },
    );
  }
}
