import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    const lower = command.toLowerCase();

    const normalizedCommand = lower
      .replace(/\s+at\s+/g, "@")
      .replace(/\s+dot\s+/g, ".")
      .replace(/\s+/g, " ");

    if (normalizedCommand.includes("add contact")) {
      const emailMatch = normalizedCommand.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      );
      const email = emailMatch ? emailMatch[0] : "";

      let cleanedName = normalizedCommand
        .replace("add contact", "")
        .replace("email", "")
        .replace(email, "")
        .trim();

      // ✅ FIX: typed 'word' as string
      cleanedName = cleanedName
        .split(" ")
        .filter(Boolean)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return NextResponse.json({
        action: "add_contact",
        data: { name: cleanedName || "Unknown", email },
      });
    }

    if (lower.includes("add campaign") || lower.includes("create campaign")) {
      const cleaned = command.replace(/create campaign/i, "").trim();
      return NextResponse.json({
        action: "create_campaign",
        data: { name: cleaned || `Voice Campaign ${Date.now()}` },
      });
    }

    if (lower.includes("start campaign") || lower.includes("launch campaign")) {
      return NextResponse.json({ action: "start_campaign" });
    }

    if (lower.includes("sequence")) {
      return NextResponse.json({
        action: "go_to_page",
        data: { page: "/sequences" },
      });
    }

    if (lower.includes("inbox")) {
      return NextResponse.json({
        action: "go_to_page",
        data: { page: "/inbox" },
      });
    }

    if (lower.includes("lead")) {
      return NextResponse.json({
        action: "go_to_page",
        data: { page: "/leads" },
      });
    }

    if (
      lower.includes("campaign") &&
      !lower.includes("create") &&
      !lower.includes("start") &&
      !lower.includes("add")
    ) {
      return NextResponse.json({
        action: "go_to_page",
        data: { page: "/campaigns" },
      });
    }

    if (lower.includes("send email")) {
      const emailMatch = command.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
      );
      const to = emailMatch ? emailMatch[0] : "";
      const message = command
        .replace(/send email to/i, "")
        .replace(to, "")
        .trim();
      return NextResponse.json({
        action: "send_email",
        data: { to, subject: "AI Generated Email", message },
      });
    }

    // AI fallback
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Convert user commands into JSON actions.
Actions: start_campaign, create_campaign, add_contact, send_email, go_to_page
Return ONLY JSON.`,
          },
          { role: "user", content: command },
        ],
      }),
    });

    const data = await response.json();
    const aiText =
      data?.choices?.[0]?.message?.content || '{"action":"unknown"}';

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch {
      parsed = { action: "unknown" };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ action: "error" });
  }
}
