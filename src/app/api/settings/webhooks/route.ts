// src/app/api/settings/webhooks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In-memory for now — store in DB if you add a Webhook model
let webhookConfig: any = {};

export async function GET() {
  return NextResponse.json(webhookConfig);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  const { url, secret, events } = await req.json();
  webhookConfig = { url, secret, events, logs: webhookConfig.logs || [] };
  return NextResponse.json({ success: true });
}
