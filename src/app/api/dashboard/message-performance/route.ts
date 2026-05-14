import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  // Get all campaigns
  const campaigns = await prisma.campaign.findMany()

  let messagesSent = 0
  let replies = 0

  campaigns.forEach(c => {

    messagesSent += c.sentCount || 0
    replies += c.replyCount || 0

  })

  // Demo sentiment split
  const positiveReplies = Math.floor(replies * 0.6)
  const negativeReplies = replies - positiveReplies

  const replyRate =
    messagesSent > 0
      ? Math.round((replies / messagesSent) * 100)
      : 0

  const positiveRate =
    messagesSent > 0
      ? Math.round((positiveReplies / messagesSent) * 100)
      : 0

  return NextResponse.json({

    messagesSent,
    replies,
    positiveReplies,
    negativeReplies,
    replyRate,
    positiveRate

  })

}