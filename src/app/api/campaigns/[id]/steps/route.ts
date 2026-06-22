// src/app/api/campaigns/[id]/steps/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* =========================
   GET STEPS
========================= */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: campaignId } = await params;

  try {
    const steps = await prisma.campaignStep.findMany({
      where: { campaignId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("Steps fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

/* =========================
   ADD STEP
========================= */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: campaignId } = await params;

  try {
    const body = await request.json();

    const lastStep = await prisma.campaignStep.findFirst({
      where: { campaignId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastStep ? lastStep.order + 1 : 1;

    const step = await prisma.campaignStep.create({
      data: {
        campaignId,
        type: body.type || "MESSAGE",
        content: body.content || "",
        // ✅ FIX: save subject field
        subject: body.subject || null,
        delay: body.delay || 0,
        order: newOrder,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("Step create error:", error);
    return NextResponse.json(
      { error: "Failed to create step" },
      { status: 500 },
    );
  }
}
