'use client'

import { useEffect, useState } from 'react'

export default function SequencePerformance() {

  const [steps, setSteps] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/sequence-performance')
      .then(res => res.json())
      .then(setSteps)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        🧩 Sequence Step Performance

      </h2>

      <div className="space-y-4">

        {steps.map(step => (

          <div key={step.id}>

            <div className="flex justify-between mb-1">

              <span>

                Step {step.order} — {step.stepName}

              </span>

              <span className="text-purple-600 font-semibold">

                {step.successRate}%

              </span>

            </div>

            <div className="w-full bg-gray-200 rounded h-3">

              <div
                className="bg-purple-600 h-3 rounded"
                style={{
                  width: `${step.successRate}%`
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}