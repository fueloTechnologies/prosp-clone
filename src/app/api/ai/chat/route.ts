import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message.toLowerCase();

    let reply = "";

    // Greetings
    if (
      message.includes("hi") ||
      message.includes("hello") ||
      message.includes("hey")
    ) {
      reply =
        "👋 Hey! I can help you generate LinkedIn outreach campaigns, cold DMs, follow-ups, and AI prospecting strategies.";
    }

    // Help
    else if (message.includes("help")) {
      reply =
        "You can ask me about cold outreach, campaigns, LinkedIn automation, reply rates, lead generation, or message personalization.";
    }

    // Cold outreach
    else if (message.includes("cold")) {
      reply =
        "Cold outreach works best when messages are short, personalized, and focused on the prospect’s pain points.";
    }

    // Campaigns
    else if (message.includes("campaign")) {
      reply =
        "AI campaigns perform better when you segment leads by industry, role, and intent signals.";
    }

    // Reply rates
    else if (message.includes("reply")) {
      reply =
        "Improving reply rates usually requires shorter personalized messages and strong opening lines.";
    }

    // Leads
    else if (message.includes("lead")) {
      reply =
        "You should enrich leads with LinkedIn activity, company size, and buying intent for higher conversions.";
    }

    // Default
    else {
      reply =
        "I'm your AI outreach assistant. Ask me about LinkedIn growth, campaigns, cold outreach, or lead generation.";
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "Something went wrong.",
      },
      { status: 500 },
    );
  }
}
