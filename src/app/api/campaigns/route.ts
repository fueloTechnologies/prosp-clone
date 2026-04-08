// src/app/api/campaigns/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.id },
    include: {
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { contacts: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(campaigns)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
      name: body.name || 'New Campaign',
      dailyLimit: body.dailyLimit || 25,
      status: 'DRAFT',
    },
    include: { steps: true, _count: { select: { contacts: true } } },
  })
  return NextResponse.json(campaign)
}
