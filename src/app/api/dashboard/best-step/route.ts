import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {

  const steps =
    await prisma.campaignStep.findMany({
      orderBy: {
        order: 'asc'
      }
    })

  let bestStep: any = null

  steps.forEach(step => {

    // Demo logic for success
    const successRate =
      Math.max(20, 90 - step.order * 20)

    if (
      !bestStep ||
      successRate > bestStep.successRate
    ) {

      bestStep = {

        stepName: step.type,
        order: step.order,
        successRate

      }

    }

  })

  return NextResponse.json(bestStep)

}