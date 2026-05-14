import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


/* =========================
   CORS HEADERS
========================= */

function corsHeaders() {

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods":
      "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type"
  }

}


/* =========================
   OPTIONS (Preflight)
========================= */

export async function OPTIONS() {

  return NextResponse.json(
    {},
    {
      headers: corsHeaders()
    }
  )

}


/* =========================
   GET LINKEDIN ACCOUNTS
========================= */

export async function GET() {

  try {

    const accounts =
      await prisma.linkedInAccount.findMany({

        orderBy: {
          createdAt: 'desc'
        }

      })

    return NextResponse.json(
      accounts,
      {
        headers: corsHeaders()
      }
    )

  }

  catch (error) {

    console.error(
      "GET ERROR:",
      error
    )

    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      {
        status: 500,
        headers: corsHeaders()
      }
    )

  }

}


/* =========================
   CREATE LINKEDIN ACCOUNT
========================= */

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    console.log(
      "Cookie received:",
      body.cookie?.substring(0, 50)
    )

    /* Get real user */

    const user =
      await prisma.user.findFirst()

    if (!user) {

      throw new Error(
        "No user found in database"
      )

    }

    const account =
      await prisma.linkedInAccount.create({

        data: {

          userId: user.id,   // ✅ REAL USER ID

          name:
            body.name || "LinkedIn",

          profileUrl:
            body.profileUrl || null,

          avatar:
            null,

          cookie:
            body.cookie || null,

          dailyLimit:
            25

        }

      })

    return NextResponse.json(
      account,
      {
        headers: corsHeaders()
      }
    )

  }

  catch (error) {

    console.error(
      "POST ERROR:",
      error
    )

    return NextResponse.json(
      { error: 'Failed to create account' },
      {
        status: 500,
        headers: corsHeaders()
      }
    )

  }

}