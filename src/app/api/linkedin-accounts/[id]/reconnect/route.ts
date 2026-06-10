import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { cookie } = await req.json();

    if (!cookie?.trim()) {
      return NextResponse.json({ error: "Cookie required" }, { status: 400 });
    }

    await prisma.linkedInAccount.update({
      where: { id },
      data: { cookie: cookie.trim(), status: "ACTIVE" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reconnect error:", error);
    return NextResponse.json({ error: "Failed to reconnect" }, { status: 500 });
  }
}
