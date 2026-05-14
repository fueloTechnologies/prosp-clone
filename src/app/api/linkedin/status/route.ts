import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const account = await prisma.linkedInAccount.findFirst();

    return NextResponse.json({
      connected: !!account,
    });
  } catch (error) {
    console.error("LINKEDIN STATUS ERROR:", error);

    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
