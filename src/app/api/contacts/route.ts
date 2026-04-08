// src/app/api/contacts/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const contacts = await prisma.contact.findMany({
    where: {
      userId: session.user.id,
      ...(status && status !== 'ALL' && { status: status as any }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // ── Bulk import ──
  if (Array.isArray(body)) {
    const result = await prisma.contact.createMany({
      data: body.map((c: any) => ({
        userId: session.user.id,
        firstName: c.firstName || c.first_name || '',
        lastName: c.lastName || c.last_name || '',
        email: c.email || c.email_address || null,
        phone: c.phone || c.phone_number || null,
        company: c.company || c.organization || null,
        position: c.position || c.title || c.job_title || null,
        linkedInUrl: c.linkedInUrl || c.linkedin_url || c.linkedin || null,
        location: c.location || c.city || null,
      })),
      skipDuplicates: true,
    })
    // Return newly created contacts
    const created = await prisma.contact.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: result.count,
    })
    return NextResponse.json(created)
  }

  // ── Single contact ──
  const contact = await prisma.contact.create({
    data: {
      userId: session.user.id,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      position: body.position || null,
      linkedInUrl: body.linkedInUrl || null,
      location: body.location || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(contact)
}
