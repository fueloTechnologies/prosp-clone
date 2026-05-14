import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    console.log('Campaign Performance API Running')

    const campaigns =
      await prisma.campaign.findMany({

        select: {
          id: true,
          name: true
        }

      })

    console.log(
      'Campaigns found:',
      campaigns.length
    )

    const results = campaigns.map(
      (c) => ({

        campaign: c.name,

        /* TEMP SAFE VALUES */

        connections: 9,
        conversations: 2,
        replyRate: 22

      })
    )

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