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

    let totalSent = 0;
    let totalReplies = 0;

    campaigns.forEach((campaign) => {
      totalSent += campaign.sentCount || 0;
      totalReplies += campaign.replyCount || 0;
    });

    const replyRate =
      totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0;
    const insights: string[] = [];

    if (replyRate > 20)
      insights.push("📈 Reply rate is healthy — campaigns performing well");
    else if (replyRate > 10)
      insights.push(
        "⚠ Reply rate is moderate — consider improving message personalization",
      );
    else insights.push("⚠ Reply rate is low — review targeting and messaging");

    if (totalSent === 0)
      insights.push("⚠ No messages sent yet — campaigns inactive");
    if (campaigns.length > 5)
      insights.push(
        "💡 Multiple campaigns active — monitor performance closely",
      );

    return NextResponse.json({ replyRate, insights });
  } catch (error) {
    console.error("AI KPI Error:", error);
    return NextResponse.json(
      { error: "Failed to load AI insights" },
      { status: 500 },
    );
  }
}
