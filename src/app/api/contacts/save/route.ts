// src/app/api/contacts/save/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const API_KEY = "prosp-extension-secret-123";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      company,
      position,
      linkedinUrl, // extension sends lowercase — normalised below
      location,
      avatar,
      userEmail,
      campaignId,
    } = body;

    if (!firstName || !linkedinUrl) {
      return NextResponse.json(
        { error: "firstName and linkedinUrl are required" },
        { status: 400 },
      );
    }

    // ── Resolve user (required field in schema) ──
    let userId: string | null = null;
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      userId = user?.id ?? null;
    }

    if (!userId) {
      // Fallback: first user (replace with proper session auth if multi-tenant)
      const firstUser = await prisma.user.findFirst({ select: { id: true } });
      userId = firstUser?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "No user found — cannot save contact" },
        { status: 400 },
      );
    }

    // ── Find or create contact ──
    // Schema field is linkedInUrl (capital I) — no unique index so we use findFirst
    let contact = await prisma.contact.findFirst({
      where: { linkedInUrl: linkedinUrl },
    });

    if (contact) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          firstName,
          lastName: lastName || "",
          email: email || null,
          company: company || "",
          position: position || "",
          location: location || "",
          avatar: avatar || "",
        },
      });
    } else {
      contact = await prisma.contact.create({
        data: {
          firstName,
          lastName: lastName || "",
          email: email || null,
          company: company || "",
          position: position || "",
          linkedInUrl: linkedinUrl, // ✅ capital I matches schema
          location: location || "",
          avatar: avatar || "",
          status: "NEW", // ✅ ContactStatus.NEW (no PENDING in your enum)
          userId,
        },
      });
    }

    // ── Link to campaign ──
    if (campaignId) {
      const existing = await prisma.campaignContact.findUnique({
        where: {
          campaignId_contactId: { campaignId, contactId: contact.id },
        },
      });

      if (!existing) {
        await prisma.campaignContact.create({
          data: {
            campaignId,
            contactId: contact.id,
            status: "PENDING", // ✅ CampaignContactStatus.PENDING — exists in your enum
          },
        });

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { totalContacts: { increment: 1 } },
        });

        console.log(`✅ Linked ${contact.firstName} → campaign ${campaignId}`);
      }
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (err: any) {
    console.error("❌ /api/contacts/save error:", err);
    return NextResponse.json(
      { error: "Failed to save contact", detail: err.message },
      { status: 500 },
    );
  }
}
