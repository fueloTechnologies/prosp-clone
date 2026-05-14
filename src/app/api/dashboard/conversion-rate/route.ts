import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  try {

    const total =
      await prisma.contact.count()

    const replied =
      await prisma.contact.count({
        where: { status: 'REPLIED' }
      })

    const rate =
      total === 0
        ? 0
        : Math.round((replied / total) * 100)

    return NextResponse.json({
      rate
    })

  }

  catch (error) {

    console.error(
      'Conversion rate error:',
      error
    )

    return NextResponse.json({
      rate: 0
    })

  }

}