// src/app/api/settings/general/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  const parts = user?.name?.split(" ") || [];
  return NextResponse.json({
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    workspaceName: user?.name || "",
    avatar: user?.image || "",
    // timezone & language stored in image field as JSON prefix — or add a Settings model
    timezone: "Asia/Kolkata",
    language: "English",
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { firstName, lastName, workspaceName, timezone, language, avatar } =
    await req.json();

  const name = workspaceName || `${firstName} ${lastName}`.trim();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      // ✅ Save avatar to the image field — this is the NextAuth standard field
      ...(avatar ? { image: avatar } : {}),
    },
  });

  return NextResponse.json({ success: true, name, image: avatar });
}
