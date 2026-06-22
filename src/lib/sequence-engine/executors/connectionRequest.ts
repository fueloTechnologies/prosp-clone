// src/lib/sequence-engine/executors/connectionRequest.ts
import prisma from "@/lib/prisma";

const APP_URL =
  process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

export async function executeConnectionRequest({
  cc,
  conversation,
  userId,
  finalContent,
}: any) {
  console.log("🔗 Executing CONNECTION_REQUEST for:", cc.contact.firstName);

  const linkedInUrl = cc.contact.linkedInUrl || cc.contact.linkedinUrl;
  if (!linkedInUrl) {
    console.log("❌ No LinkedIn URL — skipping");
    return { success: false };
  }

  try {
    const response = await fetch(`${APP_URL}/api/extension/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "execute_connection_request",
        linkedinUrl: linkedInUrl,
        message: finalContent,
      }),
    });

    if (!response.ok) {
      console.error("❌ Extension API error:", response.status);
      return { success: false };
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        direction: "SENT",
        type: "TEXT",
        content: finalContent || "Connection request sent",
        sentAt: new Date(),
      },
    });

    console.log("✅ CONNECTION_REQUEST queued");
    return { success: true };
  } catch (err) {
    console.error("❌ CONNECTION_REQUEST failed:", err);
    return { success: false };
  }
}
