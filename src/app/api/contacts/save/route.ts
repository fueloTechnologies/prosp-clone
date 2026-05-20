import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      linkedinUrl,
      position,
      company,
      location,
      avatar,
    } = body;

    // 🔥 Check API key first (for Chrome extension)
    const apiKey = req.headers.get("x-api-key");
    const isExtension =
      apiKey ===
      (process.env.EXTENSION_API_KEY || "prosp-extension-secret-123");

    let userId: string;

    if (isExtension) {
      const user = await prisma.user.findUnique({
        where: { email: body.userEmail },
      });
      if (!user) {
        console.error("❌ No user found for email:", body.userEmail);
        return NextResponse.json(
          { error: `No user found for email: ${body.userEmail}` },
          { status: 404, headers: CORS_HEADERS },
        );
      }
      userId = user.id;
    } else {
      // Web app saves — require session
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: CORS_HEADERS },
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404, headers: CORS_HEADERS },
        );
      }
      userId = user.id;
    }

    // 🔥 Check if contact already exists
    if (linkedinUrl) {
      const existing = await prisma.contact.findFirst({
        where: { userId, linkedInUrl: linkedinUrl },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Already exists", contact: existing },
          { headers: CORS_HEADERS },
        );
      }
    }

    // 🔥 Create contact
    const contact = await prisma.contact.create({
      data: {
        userId,
        firstName: firstName || "Unknown",
        lastName: lastName || "",
        linkedInUrl: linkedinUrl || null,
        position: position || null,
        company: company || null,
        location: location || null,
        avatar: avatar || null,
      },
    });

    console.log("✅ Contact saved:", contact.firstName, contact.lastName);

    return NextResponse.json(contact, { headers: CORS_HEADERS });
  } catch (error) {
    console.log("❌ Save contact error:", error);
    return NextResponse.json(
      { error: "Failed to save contact" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}
