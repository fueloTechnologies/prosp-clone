import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    /* Last 7 days */

    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

    const campaigns =
      await prisma.campaign.findMany()

    /* Calculate reply rate */

    const data =
      days.map(day => {

        let totalSent = 0
        let totalReplies = 0

        campaigns.forEach(c => {

          totalSent += c.sentCount || 0
          totalReplies += c.replyCount || 0

        })

        const replyRate =
          totalSent > 0
            ? Math.round(
                (totalReplies / totalSent) * 100
              )
            : 0

        return {

          day,
          rate: replyRate

        }

      })

    return NextResponse.json(data)

  }

  catch (error) {

    console.error(
      'Reply rate chart error:',
      error
    )

    return NextResponse.json([])

  }

}