import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const campaigns = await prisma.campaign.findMany({ where: { userId } });

  const result = campaigns.map((c: any) => {
    const replyRate =
      c.sentCount > 0 ? Math.round((c.replyCount / c.sentCount) * 100) : 0;
    return { name: c.name, replyRate };
  });

  return NextResponse.json(result);
}
