import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accounts = await prisma.linkedInAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(accounts, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Check if account already exists for this user
    const existing = await prisma.linkedInAccount.findFirst({
      where: { userId: session.user.id },
    });
    if (existing) {
      // Update instead of create
      const updated = await prisma.linkedInAccount.update({
        where: { id: existing.id },
        data: {
          name: body.name || existing.name,
          profileUrl: body.profileUrl || existing.profileUrl,
          cookie: body.cookie || existing.cookie,
          proxy: body.proxy || existing.proxy, 
          status: "ACTIVE",
        },
      });
      return NextResponse.json(updated, { headers: corsHeaders() });
    }

    const account = await prisma.linkedInAccount.create({
      data: {
        userId: session.user.id,
        name: body.name || "My LinkedIn",
        profileUrl: body.profileUrl || null,
        cookie: body.cookie || null,
        proxy: body.proxy || null, // ✅ ADD
        dailyLimit: body.dailyLimit || 25,
        status: body.status || "ACTIVE", // ✅ USE body.status
      },
    });
    return NextResponse.json(account, { headers: corsHeaders() });
  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.linkedInAccount.deleteMany({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
