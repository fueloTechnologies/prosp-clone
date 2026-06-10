import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/* =========================
   GET CAMPAIGN CONTACTS
========================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const campaignId = String(params.id);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json([]);

    const contacts = await prisma.campaignContact.findMany({
      where: { campaignId },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET CONTACTS ERROR:", error);
    return NextResponse.json([]);
  }
}

/* =========================
   ADD CONTACTS TO CAMPAIGN
========================= */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const campaignId = String(params.id);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const contactIds = body.contactIds || [];
    if (!Array.isArray(contactIds)) {
      return NextResponse.json(
        { error: "Invalid contactIds" },
        { status: 400 },
      );
    }

    const created = await prisma.campaignContact.createMany({
      data: contactIds.map((cid: string) => ({
        campaignId,
        contactId: cid,
        status: "PENDING",
        currentStep: 0,
        nextSendAt: null,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error("POST CONTACTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to add contacts" },
      { status: 500 },
    );
  }
}

/* =========================
   REMOVE CONTACT FROM CAMPAIGN
========================= */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const campaignId = String(params.id);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contactId } = await req.json();
    if (!contactId) {
      return NextResponse.json(
        { error: "contactId required" },
        { status: 400 },
      );
    }

    await prisma.campaignContact.deleteMany({
      where: { campaignId, contactId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE CONTACT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to remove contact" },
      { status: 500 },
    );
  }
}
