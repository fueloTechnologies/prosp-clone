// src/app/api/ai/sequence/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSequenceIdeas } from '@/lib/openai'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Demo fallback if no OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      subject: `${body.industry} Outreach Sequence`,
      steps: [
        {
          type: 'CONNECTION_REQUEST',
          delay: 0,
          content: `Hi {{firstName}}, I noticed your impressive work at {{company}} in the ${body.industry} space. Would love to connect and exchange ideas!`,
        },
        {
          type: 'MESSAGE',
          delay: 48,
          content: `Hi {{firstName}}, thanks for connecting!\n\nI'm reaching out because we've been working with ${body.industry} companies like yours to ${body.goal}.\n\nI'd love to share some insights — would you be open to a 15-minute call this week?`,
        },
        {
          type: 'FOLLOW_UP',
          delay: 96,
          content: `Hi {{firstName}}, just wanted to follow up on my previous message. I understand you're busy — I'll keep this short.\n\nWould a brief chat be possible? I think there's a real opportunity here for {{company}}.\n\nLet me know either way!`,
        },
        {
          type: 'FOLLOW_UP',
          delay: 168,
          content: `Hi {{firstName}}, last follow-up from me — I promise!\n\nIf the timing isn't right, no worries at all. But if you're ever looking to ${body.goal}, I'd love to reconnect.\n\nWishing you all the best!`,
        },
      ],
    })
  }

  try {
    const sequence = await generateSequenceIdeas(
      body.industry || 'SaaS',
      body.targetPersona || 'Sales Manager',
      body.goal || 'book a discovery call'
    )
    return NextResponse.json(sequence)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate sequence', details: error.message },
      { status: 500 }
    )
  }
}
