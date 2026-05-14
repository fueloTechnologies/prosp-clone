import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const campaigns =
    await prisma.campaign.findMany()

  const result =
    campaigns.map((c: any) => {

      const replyRate =
        c.sentCount > 0
          ? Math.round(
              (c.replyCount / c.sentCount) * 100
            )
          : 0

      return {

        name: c.name,
        replyRate

      }

    })

  return NextResponse.json(result)

}