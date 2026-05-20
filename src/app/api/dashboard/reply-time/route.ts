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
      include: { messages: { orderBy: { id: "asc" } } },
    });

    let totalReplyTime = 0,
      replyCount = 0;

    conversations.forEach((conversation: any) => {
      const messages: any[] = conversation.messages;
      for (let i = 1; i < messages.length; i++) {
        const timeDiff =
          new Date(messages[i].createdAt).getTime() -
          new Date(messages[i - 1].createdAt).getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        if (minutes > 0) {
          totalReplyTime += minutes;
          replyCount++;
        }
      }
    });

    const averageReplyTime =
      replyCount > 0 ? Math.floor(totalReplyTime / replyCount) : 0;
    return NextResponse.json({ averageReplyTime, replyCount });
  } catch (error) {
    console.error("Reply Time Error:", error);
    return NextResponse.json(
      { error: "Failed to load reply time" },
      { status: 500 },
    );
  }
}
