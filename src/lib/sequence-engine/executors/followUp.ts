import prisma from "@/lib/prisma";

export async function executeFollowUp({
  cc,
  conversation,
  userId,
  step,
  finalContent,
}: any) {
  try {
    console.log("📩 Sending follow-up to:", cc.contact.firstName);

    const linkedInUrl = cc.contact.linkedInUrl || cc.contact.linkedinUrl;
    if (!linkedInUrl) {
      console.log("❌ No LinkedIn URL — skipping");
      return { success: false };
    }

    // Follow-up goes through extension just like a message
    const response = await fetch(
      "http://localhost:3000/api/extension/connect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: linkedInUrl,
          message: finalContent,
          action: "send_message",
        }),
      },
    );

    if (!response.ok) {
      console.error("❌ Extension API error:", response.status);
      return { success: false };
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        direction: "SENT",
        content: finalContent,
      },
    });

    console.log("✅ Follow-up queued");
    return { success: true };
  } catch (error) {
    console.error("❌ Follow-up failed:", error);
    return { success: false };
  }
}
