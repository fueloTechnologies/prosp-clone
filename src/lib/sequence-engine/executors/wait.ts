import prisma from '@/lib/prisma'

interface ExecuteWaitProps {
  cc: any
  step: any
  stepIndex: number
  lastExecution: any
}

export async function executeWait({

  cc,
  step,
  stepIndex,
  lastExecution

}: ExecuteWaitProps) {

  console.log(
    "⏳ WAIT step detected"
  )

  if (!lastExecution?.executedAt) {

    console.log(
      "No previous execution found"
    )

    return {
      success: false
    }

  }

  const waitUntil =
    new Date(lastExecution.executedAt)

  waitUntil.setHours(
    waitUntil.getHours() + step.delay
  )

  console.log(
    "Wait until:",
    waitUntil
  )

  if (new Date() < waitUntil) {

    console.log(
      "⏳ Still waiting..."
    )

    return {
      success: false,
      waiting: true
    }

  }

  console.log(
    "✅ WAIT completed"
  )

  return {
    success: true
  }

}