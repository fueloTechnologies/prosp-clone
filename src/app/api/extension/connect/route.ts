// src/app/api/extension/connect/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 🔥 In-memory task queue (same as before)
const taskQueue: any[] = [];

// ─── Extension sends us a LinkedIn cookie + profile info ────────────────────
// Called by the Chrome extension after it grabs the li_at cookie from LinkedIn
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── Extension delivers a grabbed cookie → create LinkedInAccount ────────
    if (action === "deliver_cookie") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { cookie, name, profileUrl, avatar } = body;
      if (!cookie)
        return NextResponse.json(
          { error: "No cookie provided" },
          { status: 400 },
        );

      const account = await prisma.linkedInAccount.create({
        data: {
          userId: session.user.id,
          name: name || "My LinkedIn Account",
          profileUrl: profileUrl || "",
          avatar: avatar || "",
          cookie,
          status: "ACTIVE",
          dailyLimit: 25,
          sentToday: 0,
        },
      });
      return NextResponse.json({ success: true, account });
    }

    // ── Existing task queue logic (for campaign execution) ──────────────────
    console.log("🚀 Extension task received:", body);

    const task: any = {
      id: Date.now().toString(),
      action: action || "execute_connection_request",
      createdAt: new Date(),
    };

    if (action === "execute_connection_request") {
      task.linkedinUrl = body.linkedinUrl;
      task.message = body.message;
    }
    if (action === "scrape_url") {
      task.url = body.url;
      task.type = body.type;
      task.campaignId = body.campaignId;
    }
    if (action === "lead_finder") {
      task.filters = body.filters;
      task.campaignId = body.campaignId;
    }

    taskQueue.push(task);
    console.log(`📋 Task queued: ${task.id} | action: ${action}`);
    return NextResponse.json({ success: true, taskId: task.id });
  } catch (error) {
    console.error("❌ Extension bridge error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// 📥 Extension polls for tasks
export async function GET() {
  const task = taskQueue.shift();
  if (!task) return NextResponse.json({ task: null });
  console.log("📤 Sending task to extension:", task.id);
  return NextResponse.json({ task });
}

// ✅ Extension marks task done
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { taskId, success } = body;
    console.log("✅ Extension completed task:", taskId, success);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
