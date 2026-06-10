import { NextResponse } from "next/server";

// 🔥 In-memory task queue
const taskQueue: any[] = [];

// 🚀 Runner creates a task — just queue it, don't wait
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🚀 Extension task received:", body);

    // ✅ Handle different action types
    const action = body.action || "execute_connection_request";

    const task: any = {
      id: Date.now().toString(),
      action,
      createdAt: new Date(),
    };

    // Connection request
    if (action === "execute_connection_request") {
      task.linkedinUrl = body.linkedinUrl;
      task.message = body.message;
    }

    // Scrape URL (LinkedIn Search, Sales Nav, Event, Post, Group)
    if (action === "scrape_url") {
      task.url = body.url;
      task.type = body.type;
      task.campaignId = body.campaignId;
    }

    // Lead finder
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

  if (!task) {
    return NextResponse.json({ task: null });
  }

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
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
