// src/app/api/contacts/[id]/enrich/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import  prisma  from '@/lib/prisma'
import { enrichContact } from '@/lib/enrichment'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contact = await prisma.contact.findUnique({
    where: { id: params.id, userId: session.user.id },
  })
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Run enrichment across all data sources in parallel
  const enrichmentData = await enrichContact(
    contact.firstName,
    contact.lastName,
    contact.company || '',
    contact.email || undefined
  )

  // Update contact with enriched data
  const updated = await prisma.contact.update({
    where: { id: params.id },
    data: {
      enriched: true,
      enrichedData: enrichmentData as any,
      // Only overwrite email/phone if we found better data
      ...(enrichmentData.bestEmail &&
        !contact.email && { email: enrichmentData.bestEmail }),
      ...(enrichmentData.bestPhone &&
        !contact.phone && { phone: enrichmentData.bestPhone }),
    },
  })

  return NextResponse.json(updated)
}
