// src/app/api/campaigns/[id]/route.ts
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

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { contacts: true } },
    },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const campaign = await prisma.campaign.update({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.dailyLimit !== undefined && { dailyLimit: body.dailyLimit }),
      ...(body.totalContacts !== undefined && { totalContacts: body.totalContacts }),
    },
    include: {
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { contacts: true } },
    },
  })
  return NextResponse.json(campaign)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.campaign.delete({
    where: { id: params.id, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
}
