import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/* =========================
   CREATE NEW STEP
========================= */

export async function POST(req: Request) {

  try {

    const body =
      await req.json()

    const {
      campaignId,
      type,
      content
    } = body

    /* =========================
       GET LAST STEP ORDER
    ========================== */

    const lastStep =
      await prisma.campaignStep.findFirst({

        where: {
          campaignId
        },

        orderBy: {
          order: 'desc'
        }

      })

    const nextOrder =
      lastStep
        ? lastStep.order + 1
        : 0

    /* =========================
       CREATE STEP
    ========================== */

    const step =
      await prisma.campaignStep.create({

        data: {

          campaignId,

          order:
            nextOrder,

          type:
            type || 'MESSAGE',

          content:
            content || '',

          delay: 0

        }

      })

    return NextResponse.json(
      step
    )

  }

  catch (error) {

    console.error(
      "CREATE STEP ERROR:",
      error
    )

    return NextResponse.json(

      { error: 'Failed to create step' },

      { status: 500 }

    )

  }

}