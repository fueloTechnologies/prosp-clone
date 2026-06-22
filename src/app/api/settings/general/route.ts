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
    select: {
      name: true,
      email: true,
      image: true,
      settings: true,
    },
  });

  const parts = (user?.name || "").split(" ");

  return NextResponse.json({
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    email: user?.email || "",
    workspaceName: user?.settings?.workspaceName || user?.name || "",
    timezone: user?.settings?.timezone || "Asia/Kolkata",
    language: user?.settings?.language || "English",
    // avatar: prefer saved avatar, fall back to OAuth image
    avatar: user?.settings?.avatar || user?.image || "",
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({}, { status: 401 });

  const { firstName, lastName, workspaceName, timezone, language, avatar } =
    await req.json();

  const name = `${firstName} ${lastName}`.trim() || workspaceName || "User";

  // Update display name on user
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  // Upsert settings (create if first save, update if exists)
  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      workspaceName: workspaceName || name,
      timezone: timezone || "Asia/Kolkata",
      language: language || "English",
      ...(avatar ? { avatar } : {}),
    },
    update: {
      workspaceName: workspaceName || name,
      timezone: timezone || "Asia/Kolkata",
      language: language || "English",
      ...(avatar ? { avatar } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
