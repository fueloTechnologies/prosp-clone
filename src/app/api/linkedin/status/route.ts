// src/app/api/linkedin/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ connected: false });
    }

    const account = await prisma.linkedInAccount.findFirst({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ connected: !!account });
  } catch (error) {
    console.error("LINKEDIN STATUS ERROR:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
