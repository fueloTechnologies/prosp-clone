import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    /* Get campaigns */

    const campaigns =
      await prisma.campaign.findMany()

    /* Build leaderboard using totalContacts */

    const leaderboard =
      campaigns
        .map((c) => ({

          id: c.id,
          name: c.name,

          connections:
            c.totalContacts || 0

        }))

        /* Sort highest first */

        .sort(
          (a, b) =>
            b.connections -
            a.connections
        )

    return NextResponse.json(
      leaderboard
    )

  }

  catch (error) {

    console.error(
      'Leaderboard error:',
      error
    )

    return NextResponse.json([])

  }

}