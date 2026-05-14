import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stepExecutors } from "@/lib/sequence-engine/executors";

let isRunnerRunning = false;

function personalize(content: string, contact: any) {
  return content
    .replace(/{{firstName}}/g, contact.firstName || "")
    .replace(/{{lastName}}/g, contact.lastName || "")
    .replace(/{{company}}/g, contact.company || "")
    .replace(/{{position}}/g, contact.position || "");
}

export async function GET() {
  try {
    if (isRunnerRunning) {
      console.log("⚠️ Runner already running");
      return NextResponse.json({ success: false });
    }

    isRunnerRunning = true;
    console.log("🚀 Runner started");

    const DAILY_LIMIT = 100;
    const now = new Date();

    /* =========================
       COUNT TODAY'S MESSAGES
    ========================= */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const messagesSentToday = await prisma.message.count({
      where: { sentAt: { gte: startOfDay } },
    });

    console.log("Messages sent today:", messagesSentToday);

    if (messagesSentToday >= DAILY_LIMIT) {
      console.log("Daily limit reached — stopping runner");
      isRunnerRunning = false;
      return NextResponse.json({
        success: true,
        processed: 0,
        reason: "Daily limit reached",
      });
    }

    /* =========================
       FIND READY CONTACTS
    ========================= */

    const contacts = await prisma.campaignContact.findMany({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        OR: [{ nextSendAt: null }, { nextSendAt: { lte: now } }],
      },
      include: {
        campaign: true,
        contact: true,
      },
      take: 10,
    });

    console.log("Ready contacts:", contacts.length);

    for (const cc of contacts) {
      console.log("Processing contact:", cc.id);

      const stepIndex = cc.currentStep;

      const lastExecution = await prisma.campaignStepExecution.findFirst({
        where: {
          // @ts-ignore
          campaignContactId: cc.id,
        },
        orderBy: {
          executedAt: "desc",
        },
      }); /* =========================
         GET STEP
      ========================= */

      const step = await prisma.campaignStep.findFirst({
        where: {
          campaignId: cc.campaignId,
          order: stepIndex + 1,
        },
      });

      /* =========================
         NO MORE STEPS
      ========================= */

      if (!step) {
        console.log("✅ Sequence completed for:", cc.id);
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "COMPLETED" },
        });
        continue;
      }

      console.log("Step found:", step.type, "order:", step.order);

      /* =========================
   WAIT STEP
========================= */

      if (step.type === "WAIT") {
        console.log("WAIT step detected");

        if (!lastExecution) {
          continue;
        }
        const waitUntil = new Date((lastExecution as any).executedAt);
        waitUntil.setHours(waitUntil.getHours() + (step.delay || 0));

        console.log("Wait until:", waitUntil);

        // still waiting
        if (new Date() < waitUntil) {
          console.log(`Still waiting ${step.delay} hours`);

          continue;
        }

        console.log("WAIT completed");

        // move to next step
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: {
            currentStep: stepIndex + 1,
            status: "IN_PROGRESS",
          },
        });

        continue;
      }
      /* =========================
         GET USER
      ========================= */

      const campaign = await prisma.campaign.findUnique({
        where: { id: cc.campaignId },
      });

      if (!campaign) continue;

      const userId = campaign.userId;

      /* =========================
         FIND / CREATE CONVERSATION
      ========================= */

      let conversation = await prisma.conversation.findFirst({
        where: {
          contactId: cc.contactId,
          userId: userId,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: userId,
            contactId: cc.contactId,
          },
        });
      }

      /* =========================
         PERSONALIZE MESSAGE
      ========================= */

      const finalContent = personalize(step.content || "", cc.contact);

      console.log("Processing step type:", step.type);
      console.log("Personalized content:", finalContent);

      /* =========================
         EXECUTOR
      ========================= */

      const executor = stepExecutors[step.type as keyof typeof stepExecutors];

      if (!executor) {
        console.log("No executor found for:", step.type);
        continue;
      }

      const result = await executor({
        cc,
        conversation,
        userId,
        step,
        stepIndex,
        lastExecution,
        finalContent,
      });

      if (!result.success) {
        console.log("❌ Executor failed for:", step.type);
        continue;
      }

      /* =========================
         CREATE EXECUTION
      ========================= */

      console.log("Creating execution for step:", step.id);

      await prisma.campaignStepExecution.create({
        data: {
          campaignContactId: cc.id,
          stepId: step.id,
          status: "COMPLETED",
          scheduledFor: new Date(),
          executedAt: new Date(),
        } as any,
      });

      console.log("✅ Execution created successfully");

      /* =========================
         NEXT STEP
      ========================= */

      const nextStep = await prisma.campaignStep.findFirst({
        where: {
          campaignId: cc.campaignId,
          order: stepIndex + 2,
        },
      });

      if (!nextStep) {
        console.log("✅ Sequence completed for:", cc.contact.firstName);
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: { status: "COMPLETED" },
        });
      } else {
        await prisma.campaignContact.update({
          where: { id: cc.id },
          data: {
            currentStep: stepIndex + 1,
            status: "IN_PROGRESS",
          },
        });
      }
    }

    isRunnerRunning = false;

    return NextResponse.json({
      success: true,
      processed: contacts.length,
    });
  } catch (error) {
    console.error("RUNNER ERROR:", error);
    isRunnerRunning = false;
    return NextResponse.json({ error: "Runner failed" }, { status: 500 });
  }
}
