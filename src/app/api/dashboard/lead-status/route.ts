import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const contacts =
      await prisma.contact.findMany()

    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      REPLIED: 0,
      BOOKED: 0
    }

    contacts.forEach((c: any) => {

      if (
        c.status &&
        statusCounts[c.status] !== undefined
      ) {

        statusCounts[c.status]++

      }

    })

    const result =
      Object.keys(statusCounts).map(status => ({
        status,
        count: statusCounts[status]
      }))

    // 🔥 Always return JSON
    return NextResponse.json(result)

  }

  catch (error) {

    console.error(
      'Lead status API error:',
      error
    )

    // 🔥 Return empty array instead of crashing
    return NextResponse.json([])

  }

}