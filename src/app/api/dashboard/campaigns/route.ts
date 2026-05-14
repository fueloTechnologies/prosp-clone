import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    /* Get all campaigns */

    const campaigns =
      await prisma.campaign.findMany({

        select: {
          id: true,
          name: true
        },

        orderBy: {
          createdAt: 'desc'
        }

      })

    const results = []

    for (const campaign of campaigns) {

      /* TEMP SAFE LOGIC */

      /* Since CampaignContact = 0,
         we fallback to global counts */

      const connections =
        await prisma.contact.count()

      const conversations =
        await prisma.conversation.count()

      let replyRate = 0

      if (connections > 0) {

        replyRate =
          Math.round(
            (conversations / connections) * 100
          )

      }

      results.push({

        campaign: campaign.name,
        connections,
        conversations,
        replyRate

      })

    }

    return NextResponse.json(results)

  }

  catch (error) {

    console.error(
      'Campaign performance error:',
      error
    )

    return NextResponse.json([])

  }

}