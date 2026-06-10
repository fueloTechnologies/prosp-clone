// src/app/api/settings/members/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Simple in-memory store for demo — replace with prisma model if you add a Member table
const invites: any[] = [];

export async function GET() {
  return NextResponse.json(invites);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });
  const { email, role } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  // TODO: send actual invite email via your email provider
  invites.push({ email, role, status: "Pending", invitedAt: new Date() });
  return NextResponse.json({ success: true });
}
