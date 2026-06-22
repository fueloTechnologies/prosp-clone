// src/app/api/campaigns/[id]/launch/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const campaignId = params.id;
    const now = new Date();

    console.log("🚀 Launching campaign:", campaignId);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });

    await prisma.campaignContact.updateMany({
      where: { campaignId },
      data: {
        status: "IN_PROGRESS",
        currentStep: 0,
        nextSendAt: now,
      },
    });

    // ✅ FIX: use APP_URL env var instead of hardcoded localhost
    // This works both locally and on Vercel
    const appUrl =
      process.env.NEXTAUTH_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    fetch(`${appUrl}/api/runner`).catch((err) =>
      console.error("Runner trigger failed:", err),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LAUNCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to launch campaign" },
      { status: 500 },
    );
  }
}
