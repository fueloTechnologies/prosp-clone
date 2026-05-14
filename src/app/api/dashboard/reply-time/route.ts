import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
       messages: {
  orderBy: {
    id: 'asc',
  },
},
      },
    })

    let totalReplyTime = 0
    let replyCount = 0

    conversations.forEach((conversation: any) => {
      const messages: any[] = conversation.messages

      for (let i = 1; i < messages.length; i++) {
        const previous = messages[i - 1]
        const current = messages[i]

        const timeDiff =
          new Date(current.createdAt).getTime() -
          new Date(previous.createdAt).getTime()

        const minutes = Math.floor(timeDiff / (1000 * 60))

        if (minutes > 0) {
          totalReplyTime += minutes
          replyCount++
        }
      }
    })

    const averageReplyTime =
      replyCount > 0
        ? Math.floor(totalReplyTime / replyCount)
        : 0

    return NextResponse.json({
      averageReplyTime,
      replyCount,
    })
  } catch (error) {
    console.error('Reply Time Error:', error)

    return NextResponse.json(
      { error: 'Failed to load reply time' },
      { status: 500 }
    )
  }
}