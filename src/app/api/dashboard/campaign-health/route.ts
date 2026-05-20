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

  let totalSent = 0,
    totalReplies = 0,
    totalMeetings = 0,
    totalPositive = 0;

  campaigns.forEach((c: any) => {
    totalSent += c.sentCount || 0;
    totalReplies += c.replyCount || 0;
    totalMeetings += c.meetingCount || 0;
    totalPositive += Math.floor((c.replyCount || 0) * 0.6);
  });

  const replyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0;
  const positiveRate =
    totalReplies > 0 ? (totalPositive / totalReplies) * 100 : 0;
  const meetingRate =
    totalReplies > 0 ? (totalMeetings / totalReplies) * 100 : 0;
  const healthScore = Math.round(
    replyRate * 0.4 + positiveRate * 0.3 + meetingRate * 0.2 + 10,
  );

  let status = "Poor";
  if (healthScore > 75) status = "Healthy";
  else if (healthScore > 50) status = "Moderate";

  return NextResponse.json({ healthScore, status });
}
