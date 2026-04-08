// src/app/api/ai/personalize/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { personalizeMessage } from '@/lib/openai'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // If no OpenAI key, return a smart demo message
  if (!process.env.OPENAI_API_KEY) {
    const demoMessages: Record<string, string> = {
      linkedin: `Hi ${body.contactFirstName},\n\nYour work at ${body.contactCompany} as ${body.contactPosition} caught my eye — especially how you're navigating the current landscape.\n\nI'd love to share how we've helped similar teams cut their outreach time by 60%. Worth a quick call?\n\nBest,\n${session.user.name}`,
      email: `Subject: Quick question about ${body.contactCompany}\n\nHi ${body.contactFirstName},\n\nI came across your profile and was impressed by your work as ${body.contactPosition} at ${body.contactCompany}.\n\nWe've been helping companies like yours automate their outreach with AI — would you be open to a 15-min call to explore if it could be a fit?\n\nBest,\n${session.user.name}`,
      whatsapp: `Hi ${body.contactFirstName}! Saw your profile at ${body.contactCompany} — really interesting work. Quick Q: open to a brief chat about how we're helping similar teams? 🚀`,
    }
    return NextResponse.json({
      message: demoMessages[body.channel || 'linkedin'] || demoMessages.linkedin,
    })
  }

  try {
    const message = await personalizeMessage({
      contactFirstName: body.contactFirstName,
      contactLastName: body.contactLastName,
      contactCompany: body.contactCompany || '',
      contactPosition: body.contactPosition || '',
      contactLinkedInData: body.linkedInData || undefined,
      recentActivity: body.recentActivity || undefined,
      senderName: session.user.name || 'Your Name',
      senderCompany: body.senderCompany || 'Your Company',
      purpose: body.purpose || 'partnership and collaboration',
      template: body.template || undefined,
      channel: body.channel || 'linkedin',
    })
    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('AI personalize error:', error)
    return NextResponse.json(
      { error: 'AI generation failed', details: error.message },
      { status: 500 }
    )
  }
}
