import prisma from "@/lib/prisma";

export async function executeConnectionRequest({
  cc,
  conversation,
  userId,
  step,
  finalContent,
}: any) {
  try {
    console.log("🔗 Sending connection request to:", cc.contact.firstName);

    const linkedInUrl = cc.contact.linkedInUrl || cc.contact.linkedinUrl;
    if (!linkedInUrl) {
      console.log("❌ No LinkedIn URL — skipping");
      return { success: false };
    }

    // Queue connection request for extension to pick up
    const response = await fetch(
      "http://localhost:3000/api/extension/connect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: linkedInUrl,
          message: finalContent || step.content || "",
          action: "connection_request",
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
        content: finalContent || step.content || "Connection request sent",
      },
    });

    console.log("✅ Connection request queued");
    return { success: true };
  } catch (error) {
    console.error("❌ Connection request failed:", error);
    return { success: false };
  }
}
