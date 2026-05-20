import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const campaigns = await prisma.campaign.findMany({ where: { userId } });

  let messagesSent = 0,
    replies = 0;

  campaigns.forEach((c) => {
    messagesSent += c.sentCount || 0;
    replies += c.replyCount || 0;
  });

  const positiveReplies = Math.floor(replies * 0.6);
  const negativeReplies = replies - positiveReplies;
  const replyRate =
    messagesSent > 0 ? Math.round((replies / messagesSent) * 100) : 0;
  const positiveRate =
    messagesSent > 0 ? Math.round((positiveReplies / messagesSent) * 100) : 0;

  return NextResponse.json({
    messagesSent,
    replies,
    positiveReplies,
    negativeReplies,
    replyRate,
    positiveRate,
  });
}
