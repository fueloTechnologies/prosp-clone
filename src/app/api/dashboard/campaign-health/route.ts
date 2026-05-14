import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const campaigns =
    await prisma.campaign.findMany()

  let totalSent = 0
  let totalReplies = 0
  let totalMeetings = 0
  let totalPositive = 0

  campaigns.forEach((c: any) => {

    totalSent += c.sentCount || 0
    totalReplies += c.replyCount || 0
    totalMeetings += c.meetingCount || 0

    // simulate positive replies
    totalPositive +=
      Math.floor((c.replyCount || 0) * 0.6)

  })

  const replyRate =
    totalSent > 0
      ? (totalReplies / totalSent) * 100
      : 0

  const positiveRate =
    totalReplies > 0
      ? (totalPositive / totalReplies) * 100
      : 0

  const meetingRate =
    totalReplies > 0
      ? (totalMeetings / totalReplies) * 100
      : 0

  const healthScore =
    Math.round(

      replyRate * 0.4 +
      positiveRate * 0.3 +
      meetingRate * 0.2 +
      10

    )

  let status = 'Poor'

  if (healthScore > 75)
    status = 'Healthy'

  else if (healthScore > 50)
    status = 'Moderate'

  return NextResponse.json({

    healthScore,
    status

  })

}