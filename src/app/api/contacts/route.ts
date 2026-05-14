// src/app/api/contacts/route.ts

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'


/* =========================
   GET ALL CONTACTS
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

    const contacts =
      await prisma.contact.findMany({

        where: {
          userId: session.user.id
        },

        orderBy: {
          createdAt: 'desc'
        }

      })

    return NextResponse.json(contacts)

  } catch (error) {

    console.error("GET CONTACTS ERROR:", error)

    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )

  }

}



/* =========================
   CREATE CONTACT
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

    const contact =
      await prisma.contact.create({

        data: {

          firstName: body.firstName,

          lastName: body.lastName,

          email: body.email,

          company: body.company,

          userId: session.user.id

        }

      })

    return NextResponse.json(contact)

  } catch (error) {

    console.error("POST CONTACT ERROR:", error)

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )

  }

}