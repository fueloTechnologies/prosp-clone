// src/lib/openai.ts
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PersonalizeOptions {
  contactFirstName: string
  contactLastName: string
  contactCompany: string
  contactPosition: string
  contactLinkedInData?: string
  recentActivity?: string
  senderName: string
  senderCompany: string
  purpose: string
  template?: string
  channel: 'linkedin' | 'email' | 'whatsapp'
}

export async function personalizeMessage(options: PersonalizeOptions): Promise<string> {
  const {
    contactFirstName,
    contactLastName,
    contactCompany,
    contactPosition,
    contactLinkedInData,
    recentActivity,
    senderName,
    senderCompany,
    purpose,
    template,
    channel,
  } = options

  const systemPrompt = `You are an expert sales copywriter specializing in ${channel} outreach. 
Your goal is to write hyper-personalized messages that feel genuine and human, not robotic.
Keep messages concise, warm, and focused on value.
Never use generic phrases like "I hope this message finds you well" or "I came across your profile."
Use specific details about the prospect to show you've done your research.
For LinkedIn: keep it under 300 characters for connection requests, under 500 for messages.
For email: write a complete email with subject line.
For WhatsApp: very casual and brief.`

  const userPrompt = `Write a personalized outreach message with these details:

Prospect: ${contactFirstName} ${contactLastName}
Company: ${contactCompany}
Position: ${contactPosition}
${contactLinkedInData ? `LinkedIn Info: ${contactLinkedInData}` : ''}
${recentActivity ? `Recent Activity: ${recentActivity}` : ''}

Sender: ${senderName} from ${senderCompany}
Purpose: ${purpose}
${template ? `Base template to personalize: ${template}` : ''}

Write a highly personalized ${channel} message. Be specific, be human, be brief.
${channel === 'email' ? 'Format: SUBJECT: [subject]\n\n[body]' : 'Format: Just the message body.'}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || ''
}

export async function generateSequenceIdeas(
  industry: string,
  targetPersona: string,
  goal: string
): Promise<{ subject: string; steps: Array<{ type: string; content: string; delay: number }> }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a sales outreach expert. Generate complete outreach sequences as JSON.',
      },
      {
        role: 'user',
        content: `Create a LinkedIn outreach sequence for:
Industry: ${industry}
Target: ${targetPersona}  
Goal: ${goal}

Return JSON with:
{
  "subject": "campaign name",
  "steps": [
    {"type": "CONNECTION_REQUEST", "content": "...", "delay": 0},
    {"type": "MESSAGE", "content": "...", "delay": 48},
    {"type": "FOLLOW_UP", "content": "...", "delay": 96}
  ]
}`,
      },
    ],
    max_tokens: 800,
    response_format: { type: 'json_object' },
  })

  const content = completion.choices[0]?.message?.content || '{}'
  return JSON.parse(content)
}

export async function generateAIReply(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  contactName: string,
  context: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a helpful sales professional responding to ${contactName}. 
Be warm, professional, and focused on moving the conversation forward.
Keep replies concise and actionable. Context: ${context}`,
      },
      ...conversationHistory,
    ],
    max_tokens: 300,
    temperature: 0.6,
  })

  return completion.choices[0]?.message?.content || ''
}
