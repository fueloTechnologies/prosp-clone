import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const updated = await prisma.contact.updateMany({
      where: {
        linkedInUrl: body.linkedinUrl,
      },

      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
