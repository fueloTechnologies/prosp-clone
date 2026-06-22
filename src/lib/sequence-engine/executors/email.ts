// src/lib/sequence-engine/executors/email.ts
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function executeEmail({
  cc,
  conversation,
  userId,
  step,
  finalContent,
  finalSubject,
}: any) {
  console.log("📧 Executing EMAIL for:", cc.contact.firstName);

  const contactEmail = cc.contact?.email;
  if (!contactEmail) {
    // ✅ Graceful skip — no email on contact, don't fail the whole sequence
    console.log("⚠️ EMAIL skipped — contact has no email address");
    return { success: true, skipped: true };
  }

  // ✅ finalSubject is pre-personalized by the runner; fall back to raw step.subject
  const subject =
    finalSubject || step.subject || `Hi ${cc.contact.firstName || "there"}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const { data, error } = await resend.emails.send({
      from: `Prosp <${fromEmail}>`,
      to: contactEmail,
      subject,
      text: finalContent,
      html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111;">${finalContent.replace(/\n/g, "<br/>")}</div>`,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false };
    }

    console.log("✅ EMAIL sent to:", contactEmail, "| id:", data?.id);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        direction: "SENT",
        type: "TEXT",
        content: `[EMAIL] ${subject}\n\n${finalContent}`,
        sentAt: new Date(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return { success: true };
  } catch (err) {
    console.error("❌ EMAIL executor threw:", err);
    return { success: false };
  }
}
