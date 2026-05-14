import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const session =
      await getServerSession(authOptions)

    if (!session?.user?.id) {

      return new NextResponse(
        'Unauthorized',
        { status: 401 }
      )

    }

    const userId = session.user.id



    /* Fetch stats */

    const connections =
      await prisma.contact.count({
        where: { userId }
      })

    const conversations =
      await prisma.conversation.count({
        where: { userId }
      })



    /* CSV content */

    const csv =

`Metric,Value
Connections,${connections}
Conversations,${conversations}
Engagements,0
InMails,0
Tags,0`



    return new NextResponse(csv, {

      headers: {

        'Content-Type': 'text/csv',

        'Content-Disposition':
          'attachment; filename=analytics.csv'

      }

    })

  }

  catch (error) {

    console.error(error)

    return new NextResponse(
      'Error generating CSV',
      { status: 500 }
    )

  }

}