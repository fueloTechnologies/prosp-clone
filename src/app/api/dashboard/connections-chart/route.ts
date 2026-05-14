import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const time = searchParams.get("time") || "all";
    const campaignId = searchParams.get("campaignId"); // ✅

    const now = new Date();
    let startDate: Date | null = null;

    if (time === "week") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7,
      );
    }
    if (time === "month") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      );
    }

    const contacts = await prisma.campaignContact.findMany({
      where: {
        ...(startDate
          ? { createdAt: { gte: startDate, lte: new Date() } }
          : {}),
        ...(campaignId ? { campaignId } : {}), // ✅
      },
    });

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };

    contacts.forEach((contact) => {
      const dayName = days[new Date(contact.createdAt).getDay()];
      counts[dayName]++;
    });

    const result = Object.keys(counts).map((day) => ({
      date: day,
      value: counts[day],
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
