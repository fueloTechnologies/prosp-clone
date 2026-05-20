import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const steps = await prisma.campaignStep.findMany({
    where: { campaign: { userId } },
    orderBy: { order: "asc" },
  });

  let bestStep: any = null;

  steps.forEach((step) => {
    const successRate = Math.max(20, 90 - step.order * 20);
    if (!bestStep || successRate > bestStep.successRate) {
      bestStep = { stepName: step.type, order: step.order, successRate };
    }
  });

  return NextResponse.json(bestStep);
}
