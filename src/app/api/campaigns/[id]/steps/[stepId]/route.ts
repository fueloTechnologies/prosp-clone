// src/app/api/campaigns/[id]/steps/[stepId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* =========================
   UPDATE STEP
========================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  try {
    const { stepId } = await params;
    const body = await req.json();

    const step = await prisma.campaignStep.update({
      where: { id: stepId },
      data: {
        ...(body.content !== undefined && { content: body.content }),
        // ✅ subject is properly saved
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.delay !== undefined && { delay: Number(body.delay) }),
        ...(body.type !== undefined && { type: body.type }),
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error("Step update error:", error);
    return NextResponse.json(
      { error: "Failed to update step" },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE STEP
========================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  try {
    const { stepId } = await params;

    await prisma.campaignStep.delete({
      where: { id: stepId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Step delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete step" },
      { status: 500 },
    );
  }
}
