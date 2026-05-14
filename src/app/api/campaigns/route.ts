import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'



/* =========================
   GET CAMPAIGNS
========================= */

export async function GET() {

  try {

    const session =
      await getServerSession(authOptions)

    if (!session?.user?.id) {

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )

    }

    const campaigns =
      await prisma.campaign.findMany({

        where: {
          userId: session.user.id
        },

        include: {
          _count: {
            select: {
              contacts: true
            }
          }
        },

        orderBy: {
          createdAt: 'desc'
        }

      })



    /* 🔥 normalize totalContacts correctly */

    const normalized =
      campaigns.map((c: any) => ({

        ...c,

        totalContacts:
          c._count?.contacts || 0

      }))



    return NextResponse.json(
      normalized
    )

  }

  catch (error) {

    console.error(
      "GET CAMPAIGNS ERROR:",
      error
    )

    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )

  }

}



/* =========================
   CREATE CAMPAIGN
========================= */

export async function POST(
  req: Request
) {

  try {

    const session =
      await getServerSession(authOptions)

    if (!session?.user?.id) {

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )

    }

    const body =
      await req.json()

    const campaign =
      await prisma.campaign.create({

        data: {

          userId: session.user.id,

          name:
            body?.name ||
            'New Campaign',

          dailyLimit:
            body?.dailyLimit || 25,

          status: 'DRAFT'

        },

        include: {
          _count: {
            select: {
              contacts: true
            }
          }
        }

      })



    /* normalize correctly */

    const normalized = {

      ...campaign,

      totalContacts:
        campaign._count?.contacts || 0

    }



    return NextResponse.json(
      normalized
    )

  }

  catch (error) {

    console.error(
      "CREATE CAMPAIGN ERROR:",
      error
    )

    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )

  }

}