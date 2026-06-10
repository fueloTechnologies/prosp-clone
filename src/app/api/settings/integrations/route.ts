import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { provider, key } = await req.json();
  // Store in DB or env — for now just acknowledge
  console.log(`Integration saved: ${provider}`);
  return NextResponse.json({ success: true });
}
