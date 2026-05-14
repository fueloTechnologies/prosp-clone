import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const replied =
      await prisma.contact.count({
        where: { status: 'REPLIED' }
      })

    const booked =
      await prisma.contact.count({
        where: { status: "CONVERTED" }
      })

    const rate =
      replied === 0
        ? 0
        : Math.round((booked / replied) * 100)

    return NextResponse.json({
      rate
    })

  }

  catch (error) {

    console.error(
      'Meeting conversion error:',
      error
    )

    return NextResponse.json({
      rate: 0
    })

  }

}