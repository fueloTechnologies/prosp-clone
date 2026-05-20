import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const replied = await prisma.contact.count({
      where: { userId, status: "REPLIED" },
    });
    const booked = await prisma.contact.count({
      where: { userId, status: "CONVERTED" },
    });
    const rate = replied === 0 ? 0 : Math.round((booked / replied) * 100);

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("Meeting conversion error:", error);
    return NextResponse.json({ rate: 0 });
  }
}
