// src/app/api/linkedin-accounts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list all accounts for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const accounts = await prisma.linkedInAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(accounts);
}

// POST — create new account
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const body = await req.json();
  const account = await prisma.linkedInAccount.create({
    data: {
      userId: session.user.id,
      name: body.name || "My LinkedIn",
      profileUrl: body.profileUrl || "",
      cookie: body.cookie || "",
      proxy: body.proxy || "",
      status: body.status || "ACTIVE",
      dailyLimit: body.dailyLimit || 25,
      sentToday: 0,
    },
  });
  return NextResponse.json(account);
}

// DELETE — remove account
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { id } = await req.json();
  await prisma.linkedInAccount.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
