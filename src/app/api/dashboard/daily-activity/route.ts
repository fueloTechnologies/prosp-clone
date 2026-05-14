import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const messages = await prisma.message.findMany()

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  // Fix TypeScript typing
  const counts: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0
  }

  messages.forEach((msg: any) => {

    if (!msg.createdAt) return

    const dayIndex =
      new Date(msg.createdAt).getDay()

    const dayName =
      days[dayIndex]

    counts[dayName]++

  })

  const result =
    Object.keys(counts).map(day => ({
      day,
      count: counts[day]
    }))

  return NextResponse.json(result)

}