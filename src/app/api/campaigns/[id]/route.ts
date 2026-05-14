import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* =========================
   GET SINGLE CAMPAIGN
========================= */

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId: session.user.id,
      },

      include: {
        contacts: true,

        steps: {
          orderBy: {
            order: "asc",
          },
        },

        _count: {
          select: {
            contacts: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...campaign,
      totalContacts: campaign._count?.contacts || 0,
    });
  } catch (error) {
    console.error("GET SINGLE CAMPAIGN ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 },
    );
  }
}

/* =========================
   UPDATE CAMPAIGN
========================= */

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const campaign = await prisma.campaign.update({
      where: {
        id,
      },

      data: {
        ...(body.name !== undefined && {
          name: body.name,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),

        ...(body.dailyLimit !== undefined && {
          dailyLimit: body.dailyLimit,
        }),
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("UPDATE CAMPAIGN ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 },
    );
  }
}

/* =========================
   DELETE CAMPAIGN
========================= */

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.campaign.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE CAMPAIGN ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
