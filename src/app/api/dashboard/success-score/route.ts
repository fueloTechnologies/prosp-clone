import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const campaigns = await prisma.campaign.findMany({
    include: {
      contacts: true,
      steps: true
    }
  })

  const scores = campaigns.map((c) => {

    const connections = c.contacts.length
    const conversations = Math.floor(connections * 0.3)
    const replies = Math.floor(connections * 0.2)
    const meetings = Math.floor(connections * 0.1)

    const score =
      connections * 0.4 +
      conversations * 0.3 +
      replies * 0.2 +
      meetings * 0.1

    return {
      id: c.id,
      name: c.name,
      score: Math.round(score)
    }

  })

  return NextResponse.json(scores)

}