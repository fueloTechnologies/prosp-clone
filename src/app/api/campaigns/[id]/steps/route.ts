// src/app/api/campaigns/[id]/steps/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Add a new step to a campaign
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify the campaign belongs to this user
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const count = await prisma.campaignStep.count({ where: { campaignId: params.id } })

  const step = await prisma.campaignStep.create({
    data: {
      campaignId: params.id,
      order: count + 1,
      type: body.type || 'MESSAGE',
      delay: body.delay ?? 48,
      content: body.content || '',
      subject: body.subject || null,
      aiEnhanced: body.aiEnhanced || false,
    },
  })
  return NextResponse.json(step)
}

// Bulk update all steps (reorder, edit content)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const steps: any[] = await req.json()

  const updated = await Promise.all(
    steps.map((step, idx) =>
      prisma.campaignStep.update({
        where: { id: step.id },
        data: {
          order: idx + 1,
          content: step.content,
          type: step.type,
          delay: step.delay,
          subject: step.subject || null,
          aiEnhanced: step.aiEnhanced || false,
        },
      })
    )
  )
  return NextResponse.json(updated)
}

// Delete a specific step
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { stepId } = await req.json()
  await prisma.campaignStep.delete({ where: { id: stepId } })

  // Re-order remaining steps
  const remaining = await prisma.campaignStep.findMany({
    where: { campaignId: params.id },
    orderBy: { order: 'asc' },
  })
  await Promise.all(
    remaining.map((s: { id: string }, idx: number) =>
      prisma.campaignStep.update({ where: { id: s.id }, data: { order: idx + 1 } })
    )
  )
  return NextResponse.json({ success: true })
}
