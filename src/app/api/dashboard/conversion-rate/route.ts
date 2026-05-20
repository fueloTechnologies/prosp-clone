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

    const total = await prisma.contact.count({ where: { userId } });
    const replied = await prisma.contact.count({
      where: { userId, status: "REPLIED" },
    });
    const rate = total === 0 ? 0 : Math.round((replied / total) * 100);

    return NextResponse.json({ rate });
  } catch (error) {
    console.error("Conversion rate error:", error);
    return NextResponse.json({ rate: 0 });
  }
}
