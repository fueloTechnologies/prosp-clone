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

    const contacts = await prisma.contact.findMany({ where: { userId } });

    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      REPLIED: 0,
      BOOKED: 0,
    };

    contacts.forEach((c: any) => {
      if (c.status && statusCounts[c.status] !== undefined)
        statusCounts[c.status]++;
    });

    const result = Object.keys(statusCounts).map((status) => ({
      status,
      count: statusCounts[status],
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Lead status API error:", error);
    return NextResponse.json([]);
  }
}
