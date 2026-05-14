import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const steps = await prisma.campaignStep.findMany({
    orderBy: {
      order: 'asc'
    }
  })

  const performance = steps.map(step => {

    // Demo success logic
    const successRate =
      Math.max(20, 90 - step.order * 20)

    return {

      id: step.id,
      stepName: step.type,
      order: step.order,
      successRate

    }

  })

  return NextResponse.json(performance)

}