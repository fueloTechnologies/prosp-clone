import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const executions = await prisma.campaignStepExecution.findMany({
      where: {
        step: {
          is: {
            campaignId: params.id,
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
