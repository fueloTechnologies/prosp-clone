import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const executions = await prisma.campaignStepExecution.findMany({
      where: {
        step: {
          is: {
            campaignId: id,
          },
        },
      },
      include: {
        step: true,

        campaignContact: {
          include: {
            contact: true,
          },
        },
      },

      orderBy: {
        executedAt: "desc",
      },

      take: 50,
    });

    return NextResponse.json(executions);
  } catch (error) {
    console.error("ACTIVITY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch activity",
      },
      {
        status: 500,
      },
    );
  }
}
