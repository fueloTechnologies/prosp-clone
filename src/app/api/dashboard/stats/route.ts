import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    // Connections
    const connections =
      await prisma.contact.count()

    // Conversations
    const conversations =
      await prisma.conversation.count()

    // Engagements
    const engagements =
      await prisma.campaign.count()

    // InMails
    const inmails =
      await prisma.message.count()

    // Tags
    const contacts =
      await prisma.contact.findMany({
        select: { tags: true }
      })

    const uniqueTags =
      new Set(
        contacts.flatMap(c => c.tags)
      )

    const tags = uniqueTags.size

    return NextResponse.json({
      connections,
      conversations,
      engagements,
      inmails,
      tags
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )

  }

}