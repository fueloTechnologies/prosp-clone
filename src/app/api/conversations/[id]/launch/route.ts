import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: campaignId } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { contacts: true },
    });

    if (!campaign || campaign.userId !== session.user.id)
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );

    const campaignContacts = campaign.contacts;

    if (campaignContacts.length === 0)
      return NextResponse.json(
        { error: "No contacts in this campaign" },
        { status: 400 },
      );

    for (const cc of campaignContacts) {
      const existing = await prisma.campaignContact.findFirst({
        where: {
          campaignId,
          contactId: (cc as any).contactId ?? (cc as any).id,
        },
      });

      if (!existing) {
        await prisma.campaignContact.create({
          data: {
            campaignId,
            contactId: (cc as any).contactId ?? (cc as any).id,
            status: "PENDING",
            currentStep: 0,
            nextSendAt: new Date(),
          },
        });
      } else {
        await prisma.campaignContact.update({
          where: { id: existing.id },
          data: {
            status: "PENDING",
            currentStep: 0,
            nextSendAt: new Date(),
          },
        });
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign launched with ${campaignContacts.length} contacts`,
    });
  } catch (error) {
    console.error("LAUNCH ERROR:", error);
    return NextResponse.json(
      { error: "Failed to launch campaign" },
      { status: 500 },
    );
  }
}
