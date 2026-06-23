// src/app/api/ai/chat/route.ts
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Lin-C AI, a world-class LinkedIn outreach and B2B sales expert embedded inside LinkedIn-Connector — an AI-powered LinkedIn automation platform.

Your job is to help users:
- Write high-converting LinkedIn connection requests (under 300 characters)
- Write engaging LinkedIn DMs and follow-up sequences
- Craft cold emails with strong subject lines and CTAs
- Improve reply rates with personalisation tips
- Build multi-step outreach sequences
- Analyse and rewrite weak messages
- Generate icebreakers from a prospect's name, company, or role

Tone & formatting rules:
- Be concise, direct, and actionable — no fluff
- Use markdown formatting (bold, bullet points) where it aids clarity
- For LinkedIn DMs: always keep them short (2-4 sentences max), conversational, never salesy
- For emails: professional but warm, clear subject line, one CTA
- For sequences: label each step (Day 1, Day 3, Day 7 etc.)
- Never write generic templates — always tailor to the context given
- Never explain what you're doing — just deliver the output
- Never output raw JSON or code unless specifically asked
- If the user gives a name/company/role, use it in the output
- End every outreach piece on a soft, low-friction ask

You represent LinkedIn-Connector. Be sharp, helpful, and human.`;

const SUGGESTIONS = [
  "Write a cold LinkedIn DM to a VP of Sales at a SaaS company",
  "Generate a 3-step follow-up sequence",
  "Rewrite this message to improve reply rate",
  "Write a subject line for a cold email to a founder",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ reply: "Please send a message." }, { status: 400 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10), // keep last 10 turns for context
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 🔑 Add your Groq API key to .env as: GROQ_API_KEY=gsk_...
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // fastest + smartest free Groq model
        max_tokens: 1024,
        temperature: 0.7,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json({ reply: "AI service error. Please try again." }, { status: 500 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply, suggestions: SUGGESTIONS });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ reply: "Something went wrong. Please try again." }, { status: 500 });
  }
}