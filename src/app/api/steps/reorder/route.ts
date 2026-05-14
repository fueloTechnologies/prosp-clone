import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/* =========================
   REORDER STEPS
========================= */

export async function PUT(
  req: Request
) {

  try {

    const body =
      await req.json()

    const steps =
      body.steps || []

    /* Validate input */

    if (!Array.isArray(steps)) {

      return NextResponse.json(
        { error: 'Invalid steps array' },
        { status: 400 }
      )

    }

    /* =========================
       TRANSACTION UPDATE
    ========================== */

    await prisma.$transaction(

      steps.map((step: any) =>

        prisma.campaignStep.update({

          where: {
            id: step.id
          },

          data: {
            order: step.order
          }

        })

      )

    )

    return NextResponse.json({
      success: true
    })

  }

  catch (error) {

    console.error(
      "REORDER ERROR:",
      error
    )

    return NextResponse.json(
      { error: 'Failed to reorder steps' },
      { status: 500 }
    )

  }

}