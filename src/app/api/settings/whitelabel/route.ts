// src/app/api/settings/whitelabel/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

let config: any = {};

export async function GET() {
  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  config = await req.json();
  return NextResponse.json({ success: true });
}
