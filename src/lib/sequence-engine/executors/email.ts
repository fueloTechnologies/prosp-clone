import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function executeEmail({
  cc,
  conversation,
  userId,
  step,
  finalContent,
}: any) {
  try {
    console.log("📧 Sending email to:", cc.contact.firstName);

    const email = cc.contact.email;
    if (!email) {
      console.log("❌ No email address — skipping");
      return { success: false };
    }

    const subject = step.subject
      ? step.subject
          .replace(
            /{{firstName}}/g,
            (cc.contact.firstName || "").split(" ")[0].trim(),
          )
          .replace(/{{lastName}}/g, (cc.contact.lastName || "").trim())
          .replace(
            /{{company}}/g,
            (cc.contact.company || "").split("·")[0].trim(),
          )
          .replace(
            /{{position}}/g,
            (cc.contact.position || "").split("·")[0].trim(),
          )
      : `Hi ${cc.contact.firstName || "there"}`;

    const { data, error } = await resend.emails.send({
      from: "Prosp <onboarding@resend.dev>", // swap with your verified domain later
      to: email,
      subject,
      text: finalContent,
      html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111;">${finalContent.replace(/\n/g, "<br/>")}</div>`,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false };
    }

    console.log("✅ Email sent, id:", data?.id);

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId,
        direction: "SENT",
        type: "TEXT",
        content: finalContent,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email executor failed:", error);
    return { success: false };
  }
}
