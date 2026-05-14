'use client'

import { useEffect, useState } from 'react'

export default function BestPerformingStep() {

  const [step, setStep] =
    useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/best-step')
      .then(res => res.json())
      .then(setStep)

  }, [])

  if (!step) return null

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        🏆 Best Performing Step

      </h2>

      <div className="space-y-2">

        <div className="text-lg font-medium">

          Step {step.order} — {step.stepName}

        </div>

        <div className="text-purple-600 font-semibold text-xl">

          {step.successRate}% Success Rate

        </div>

      </div>

    </div>

  )

}