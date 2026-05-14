import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  // Get latest contacts
  const contacts = await prisma.contact.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Get latest conversations
  const conversations = await prisma.conversation.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Merge activities
  const activities = [

    ...contacts.map(c => ({
      type: 'connection',
      text: `Connected with ${c.firstName} ${c.lastName}`,
      date: c.createdAt
    })),

    ...conversations.map(conv => ({
      type: 'conversation',
      text: `Conversation started`,
      date: conv.createdAt
    }))

  ]

  // Sort latest first
  activities.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  )

  return NextResponse.json(
    activities.slice(0, 10)
  )

}
