import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/* =========================
   UPDATE STEP
========================= */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const params =
      await context.params

    const stepId =
      String(params.id)

    const body =
      await req.json()

    const updated =
      await prisma.campaignStep.update({

        where: {
          id: stepId
        },

        data: {

          content:
            body.content,

          delay:
            body.delay

        }

      })

    return NextResponse.json(
      updated
    )

  }

  catch (error) {

    console.error(
      "UPDATE STEP ERROR:",
      error
    )

    return NextResponse.json(

      { error: 'Failed to update step' },

      { status: 500 }

    )

  }

}



/* =========================
   DELETE STEP
========================= */

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const params =
      await context.params

    const stepId =
      String(params.id)

    console.log(
      "Deleting step:",
      stepId
    )

    /* =========================
       GET STEP BEFORE DELETE
    ========================== */

    const step =
      await prisma.campaignStep.findUnique({

        where: {
          id: stepId
        }

      })

    if (!step) {

      return NextResponse.json(

        { error: "Step not found" },

        { status: 404 }

      )

    }

    const campaignId =
      step.campaignId

    const deletedOrder =
      step.order

    /* =========================
       DELETE STEP
    ========================== */

    await prisma.campaignStep.delete({

      where: {
        id: stepId
      }

    })

    /* =========================
       FIX ORDER GAP
    ========================== */

    await prisma.campaignStep.updateMany({

      where: {

        campaignId:

          campaignId,

        order: {

          gt:

            deletedOrder

        }

      },

      data: {

        order: {

          decrement: 1

        }

      }

    })

    return NextResponse.json({

      success: true

    })

  }

  catch (error) {

    console.error(
      "DELETE STEP ERROR:",
      error
    )

    return NextResponse.json(

      { error: 'Failed to delete step' },

      { status: 500 }

    )

  }

}