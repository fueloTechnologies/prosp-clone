import { NextResponse } from "next/server"
import { Resend } from "resend"

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { to, subject, content } = body

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: "Missing email fields" },
        { status: 400 }
      )
    }

    const resend = getResend()
    const response = await resend.emails.send({
  from: "Prosp Clone <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: content,
    })

    console.log("Email sent:", response)

    return NextResponse.json({
      success: true,
      response,
    })

  } catch (error) {
    console.error("Email send error:", error)

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}