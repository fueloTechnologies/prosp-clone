// src/app/api/runner/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stepExecutors } from "@/lib/sequence-engine/executors";

let isRunnerRunning = false;

/* ─────────────────────────────────────────
   Personalize both content AND subject
───────────────────────────────────────── */
function personalize(content: string, contact: any): string {
  if (!content) return "";
  const firstName = (contact.firstName || "").split(" ")[0].trim();
  const lastName = (contact.lastName || "").trim();
  const company = (contact.company || "").split("·")[0].split("|")[0].trim();
  const position = (contact.position || "")
    .split("·")[0]
    .split("|")[0]
    .split("—")[0]
    .trim();

  return content
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{lastName}}/g, lastName)
    .replace(/{{company}}/g, company)
    .replace(/{{position}}/g, position);
}

export async function GET() {
  try {
    if (isRunnerRunning) {
      console.log("⚠️ Runner already running");
      return NextResponse.json({ success: false, reason: "Already running" });
    }

    isRunnerRunning = true;
    console.log("🚀 Runner started");

    const now = new Date();
    const DAILY_LIMIT = 100;

    // Count today's messages
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const messagesSentToday = await prisma.message.count({
      where: { sentAt: { gte: startOfDay } },
    });

    if (messagesSentToday >= DAILY_LIMIT) {
      console.log("Daily limit reached");
      isRunnerRunning = false;
      return NextResponse.json({
        success: true,
        reason: "Daily limit reached",
      });
    }

    // Find contacts ready to process
    const contacts = await prisma.campaignContact.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        OR: [{ nextSendAt: null }, { nextSendAt: { lte: now } }],
      },
      include: { campaign: true, contact: true },
      take: 10,
    });

    console.log("Ready contacts:", contacts.length);

    for (const cc of contacts) {
      console.log(
        `\n📋 Processing: ${cc.contact.firstName} | currentStep: ${cc.currentStep}`,
      );

      // order is 1-based; currentStep starts at 0
      const step = await prisma.campaignStep.findFirst({
        where: { campaignId: cc.campaignId, order: cc.currentStep + 1 },
      });

      if (!step) {
        console.log("✅ No more steps — marking COMPLETED");
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "COMPLETED" },
        });
        continue;
      }

      console.log(`Step: ${step.type} (order ${step.order})`);

      // ✅ FIX: get last execution filtered by THIS step's id so WAIT doesn't
      //    accidentally read a previous step's execution as its own.
      const lastExecution = await prisma.campaignStepExecution.findFirst({
        where: {
          campaignContactId: cc.id,
          stepId: step.id,
        } as any,
        orderBy: { executedAt: "desc" },
      });

      // ── WAIT STEP ──
      if (step.type === "WAIT") {
        // Get the execution of the PREVIOUS step so we know when it finished
        const prevStep = await prisma.campaignStep.findFirst({
          where: { campaignId: cc.campaignId, order: cc.currentStep },
        });

        const prevExecution = prevStep
          ? await prisma.campaignStepExecution.findFirst({
              where: {
                campaignContactId: cc.id,
                stepId: prevStep.id,
              } as any,
              orderBy: { executedAt: "desc" },
            })
          : null;

        if (!prevExecution) {
          console.log("⏳ WAIT: no previous step execution yet — skipping");
          continue;
        }

        const waitHours = step.delay || 1;
        const waitUntil = new Date(prevExecution.executedAt!);
        waitUntil.setHours(waitUntil.getHours() + waitHours);

        if (new Date() < waitUntil) {
          const mins = Math.round((waitUntil.getTime() - Date.now()) / 60000);
          console.log(`⏳ WAIT: ${mins} minutes remaining`);
          continue;
        }

        // Wait period over — record and advance
        console.log("✅ WAIT completed — advancing");
        if (!lastExecution) {
          await prisma.campaignStepExecution.create({
            data: {
              campaignContactId: cc.id,
              stepId: step.id,
              status: "COMPLETED",
              scheduledFor: new Date(),
              executedAt: new Date(),
            } as any,
          });
        }
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { currentStep: cc.currentStep + 1, status: "IN_PROGRESS" },
        });
        continue;
      }

      // ── ALL OTHER STEPS ──
      const campaign = await prisma.campaign.findUnique({
        where: { id: cc.campaignId },
      });
      if (!campaign) continue;

      const userId = campaign.userId;

      let conversation = await prisma.conversation.findFirst({
        where: { contactId: cc.contactId, userId },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { userId, contactId: cc.contactId },
        });
      }

      // ✅ FIX: personalize both content AND subject
      const finalContent = personalize(step.content || "", cc.contact);
      const finalSubject = personalize(step.subject || "", cc.contact);

      console.log("Content:", finalContent?.slice(0, 80));

      const executor = stepExecutors[step.type as keyof typeof stepExecutors];
      if (!executor) {
        console.log(`⚠️ No executor for: ${step.type}`);
        continue;
      }

      const result = await executor({
        cc,
        conversation,
        userId,
        step,
        stepIndex: cc.currentStep,
        lastExecution,
        finalContent,
        finalSubject, // ✅ passed through
      });

      if (!result.success && !(result as any).skipped) {
        console.log(`❌ Executor failed for ${step.type}`);
        continue;
      }

      // Record execution
      await prisma.campaignStepExecution.create({
        data: {
          campaignContactId: cc.id,
          stepId: step.id,
          status: "COMPLETED",
          scheduledFor: new Date(),
          executedAt: new Date(),
        } as any,
      });

      // Check if there's a next step
      const nextStep = await prisma.campaignStep.findFirst({
        where: { campaignId: cc.campaignId, order: cc.currentStep + 2 },
      });

      if (!nextStep) {
        console.log(`✅ Sequence completed for: ${cc.contact.firstName}`);
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "COMPLETED" },
        });
      } else {
        let nextSendAt = new Date();
        if (nextStep.type !== "WAIT" && nextStep.delay && nextStep.delay > 0) {
          nextSendAt = new Date();
          nextSendAt.setHours(nextSendAt.getHours() + nextStep.delay);
        }

        console.log(`➡️ Advancing to step ${cc.currentStep + 2}`);
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: {
            currentStep: cc.currentStep + 1,
            status: "IN_PROGRESS",
            nextSendAt,
          },
        });
      }
    }

    isRunnerRunning = false;
    console.log("✅ Runner finished");
    return NextResponse.json({ success: true, processed: contacts.length });
  } catch (error) {
    console.error("RUNNER ERROR:", error);
    isRunnerRunning = false;
    return NextResponse.json({ error: "Runner failed" }, { status: 500 });
  }
}
