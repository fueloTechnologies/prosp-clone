// src/lib/sequence-engine/executors/message.ts
import prisma from "@/lib/prisma";

const APP_URL =
  process.env.NEXTAUTH_URL || process.env.APP_URL || "http://localhost:3000";

export async function executeMessage({
  cc,
  conversation,
  userId,
  finalContent,
}: any) {
  console.log("📩 Executing MESSAGE for:", cc.contact.firstName);

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
        content: finalContent,
        sentAt: new Date(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    console.log("✅ MESSAGE queued");
    return { success: true };
  } catch (err) {
    console.error("❌ MESSAGE failed:", err);
    return { success: false };
  }
}
