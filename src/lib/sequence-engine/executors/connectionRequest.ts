import prisma from "@/lib/prisma";

interface ExecuteConnectionRequestProps {
  cc: any;
  conversation: any;
  userId: string;
  step: any;
}

export async function executeConnectionRequest({
  cc,
  conversation,
  userId,
  step,
}: ExecuteConnectionRequestProps) {
  try {
    console.log("🔗 Sending LinkedIn request to:", cc.contact.firstName);

    // FIX: schema uses linkedInUrl (capital I and N)
    const linkedInUrl = cc.contact.linkedInUrl || cc.contact.linkedinUrl;

    console.log("LinkedIn URL:", linkedInUrl);

    if (!linkedInUrl) {
      console.log("❌ No LinkedIn URL — skipping");
      return { success: false };
    }

    const response = await fetch(
      "http://localhost:3000/api/extension/connect",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: linkedInUrl,
          message: step.content || "",
        }),
      },
    );

    const data = await response.json();
    console.log("✅ Extension response:", data);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: userId,
        direction: "SENT",
        content: step.content || "Connection request sent",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("❌ LinkedIn connect failed:", error);
    return { success: false };
  }
}
