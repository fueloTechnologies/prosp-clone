// src/app/api/conversations/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import  prisma  from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    include: {
      contact: true,
      linkedInAcc: true,
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  })
  return NextResponse.json(conversations)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Check if conversation already exists for this contact
  const existing = await prisma.conversation.findFirst({
    where: {
      userId: session.user.id,
      contactId: body.contactId,
      channel: body.channel || 'LINKEDIN',
    },
    include: { contact: true, messages: { orderBy: { sentAt: 'desc' }, take: 1 } },
  })
  if (existing) return NextResponse.json(existing)

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      contactId: body.contactId,
      linkedInAccId: body.linkedInAccId || null,
      channel: body.channel || 'LINKEDIN',
    },
    include: {
      contact: true,
      linkedInAcc: true,
      messages: { orderBy: { sentAt: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json(conversation)
}
