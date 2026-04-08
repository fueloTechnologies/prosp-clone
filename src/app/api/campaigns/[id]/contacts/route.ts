// src/app/api/campaigns/[id]/contacts/route.ts
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

  const contacts = await prisma.campaignContact.findMany({
    where: { campaignId: params.id },
    include: { contact: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contactIds }: { contactIds: string[] } = await req.json()

  // Verify campaign ownership
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Add contacts, skip duplicates
  await prisma.campaignContact.createMany({
    data: contactIds.map((contactId) => ({
      campaignId: params.id,
      contactId,
      status: 'PENDING',
    })),
    skipDuplicates: true,
  })

  // Update totalContacts count
  const count = await prisma.campaignContact.count({ where: { campaignId: params.id } })
  await prisma.campaign.update({
    where: { id: params.id },
    data: { totalContacts: count },
  })

  return NextResponse.json({ success: true, count })
}
