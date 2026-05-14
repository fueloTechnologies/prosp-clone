import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const time = searchParams.get("time") || "all";
    const campaignId = searchParams.get("campaignId"); // ✅

    const now = new Date();
    const startDate = new Date();
    if (time === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setDate(now.getDate() - 7);
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(campaignId ? { campaignId } : {}), // ✅
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, number> = {};
    const days = time === "month" ? 30 : 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", { weekday: "short" });
      grouped[key] = 0;
    }

    for (const conv of conversations) {
      const key = new Date(conv.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (grouped[key] !== undefined) grouped[key]++;
    }

    const chartData = Object.keys(grouped).map((date) => ({
      date,
      value: grouped[date],
    }));
    return NextResponse.json(chartData);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
