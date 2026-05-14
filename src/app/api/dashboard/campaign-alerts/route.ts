import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const campaigns =
      await prisma.campaign.findMany({
        include: {
          contacts: true
        }
      })

    const alerts: string[] = []

    campaigns.forEach((c) => {

      if (c.contacts.length === 0) {

        alerts.push(
          `${c.name} has no contacts`
        )

      }

    })

    return NextResponse.json(alerts)

  }

  catch (error) {

    console.error(
      'Campaign alerts error:',
      error
    )

    return NextResponse.json([])

  }

}