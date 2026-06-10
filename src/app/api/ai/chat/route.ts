import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },

        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324:free",

          max_tokens: 80,

          messages: [
            {
              role: "system",
              content: `
You are an AI assistant for LinkedIn outreach and SaaS sales.

Rules:
- Give concise and clean responses
- Use proper formatting
- Avoid broken unicode characters
- Keep LinkedIn DMs short
- Keep emails professional
- Never output JSON
- Never explain yourself
`,
            },

            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        reply: "AI server error.",
      },
      { status: 500 },
    );
  }
}
