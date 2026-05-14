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

    console.log("Launching campaign:", campaignId);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });

    await prisma.campaignContact.updateMany({
      where: { campaignId: campaignId },
      data: {
        status: "IN_PROGRESS",
        currentStep: 0,
        nextSendAt: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LAUNCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to launch campaign" },
      { status: 500 },
    );
  }
}
