import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    /* Count connections */

    const connections =
      await prisma.contact.count()

    /* Count conversations */

    const conversations =
      await prisma.conversation.count()

    /* Replies (using messages table) */

    const replies =
      await prisma.message.count()

    /* Meetings (future use) */

    const meetings = 0

    return NextResponse.json([

      {
        stage: 'Connections',
        value: connections
      },

      {
        stage: 'Conversations',
        value: conversations
      },

      {
        stage: 'Replies',
        value: replies
      },

      {
        stage: 'Meetings',
        value: meetings
      }

    ])

  }

  catch (error) {

    console.error(error)

    return NextResponse.json([])

  }

}