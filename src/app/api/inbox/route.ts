import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const conversations =
      await prisma.conversation.findMany({

        orderBy: {
          lastMessageAt: 'desc'
        },

        include: {

          contact: true,

          messages: {
            orderBy: {
              sentAt: 'asc'
            }
          }

        }

      })

    return NextResponse.json(
      conversations
    )

  } catch (error) {

    console.error(
      'Inbox fetch error:',
      error
    )

    return NextResponse.json(
      { error: 'Failed to load inbox' },
      { status: 500 }
    )

  }

}