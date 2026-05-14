import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const conversations =
    await prisma.conversation.findMany()

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const sentCounts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0
  }

  const replyCounts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0
  }

  conversations.forEach((c: any) => {

    if (!c.createdAt) return

    const dayIndex =
      new Date(c.createdAt).getDay()

    const dayName =
      days[dayIndex]

    sentCounts[dayName]++

    // Simulated replies logic
    if (Math.random() > 0.5) {

      replyCounts[dayName]++

    }

  })

  const result =
    days.map(day => {

      const sent =
        sentCounts[day]

      const replies =
        replyCounts[day]

      const replyRate =
        sent > 0
          ? Math.round((replies / sent) * 100)
          : 0

      return {

        day,
        replyRate

      }

    })

  return NextResponse.json(result)

}