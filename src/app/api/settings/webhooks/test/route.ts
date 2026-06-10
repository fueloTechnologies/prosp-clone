// src/app/api/settings/webhooks/test/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();
  if (!url)
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "test",
        data: { message: "Test from Prosp", timestamp: new Date() },
      }),
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
  }
}
