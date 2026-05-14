'use client'

import { useEffect, useState } from 'react'

type KPIData = {
  replyRate: number
  insights: string[]
}

export default function AIKPIWidget() {
  const [data, setData] =
    useState<KPIData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/ai-kpi')
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) =>
        console.error('AI KPI error:', err)
      )
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">
        🤖 AI Performance Insights
      </h2>

      {data ? (
        <div className="space-y-3">
          <p className="text-gray-700">
            Overall Reply Rate:{' '}
            <span className="font-semibold text-purple-600">
              {data.replyRate}%
            </span>
          </p>

          <ul className="space-y-2">
            {data.insights.map(
              (insight, index) => (
                <li
                  key={index}
                  className="text-gray-700"
                >
                  {insight}
                </li>
              )
            )}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500">
          Loading insights...
        </p>
      )}
    </div>
  )
}