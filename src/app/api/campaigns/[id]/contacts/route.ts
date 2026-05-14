import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'


/* =========================
   GET CAMPAIGN CONTACTS
========================= */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const params = await context.params
    const campaignId = String(params.id)

    const session =
      await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const contacts =
      await prisma.campaignContact.findMany({

        where: {
          campaignId
        },

        include: {
          contact: true
        },

        orderBy: {
          createdAt: 'desc'
        }

      })

    return NextResponse.json(contacts)

  } catch (error) {

    console.error("GET CONTACTS ERROR:", error)

    return NextResponse.json([])

  }
}



/* =========================
   ADD CONTACTS TO CAMPAIGN
========================= */

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  try {

    const params =
      await context.params

    const campaignId =
      String(params.id)

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

    const contactIds =
      body.contactIds || []

    if (!Array.isArray(contactIds)) {

      return NextResponse.json(
        { error: 'Invalid contactIds' },
        { status: 400 }
      )

    }

    console.log(
      "Adding contacts:",
      contactIds
    )

    const created =
      await prisma.campaignContact.createMany({

        data:

          contactIds.map((cid: string) => ({

            campaignId,
            contactId: cid,
            status: 'PENDING',
            currentStep: 0,
            nextSendAt: null

          })),

        skipDuplicates: true

      })

    console.log(
      "Contacts added:",
      created.count
    )

    return NextResponse.json({

      success: true,
      count: created.count

    })

  }

  catch (error) {

    console.error(
      'POST CONTACTS ERROR:',
      error
    )

    return NextResponse.json(
      { error: 'Failed to add contacts' },
      { status: 500 }
    )

  }

}