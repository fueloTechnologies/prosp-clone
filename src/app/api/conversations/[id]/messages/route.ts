// src/app/api/conversations/[id]/messages/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the conversation belongs to this user
  const conv = await prisma.conversation.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { sentAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const conv = await prisma.conversation.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()

  const message = await prisma.message.create({
    data: {
      conversationId: params.id,
      userId: session.user.id,
      linkedInAccId: conv.linkedInAccId || null,
      direction: 'SENT',
      type: body.type || 'TEXT',
      content: body.content,
      aiGenerated: body.aiGenerated || false,
    },
  })

  // Update conversation's lastMessageAt
  await prisma.conversation.update({
    where: { id: params.id },
    data: { lastMessageAt: new Date() },
  })

  return NextResponse.json(message)
}
