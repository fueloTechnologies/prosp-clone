'use client'

import { useEffect, useState } from 'react'

export default function ConversionRateWidget() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/conversion-rate')
      .then(res => res.json())
      .then(setData)

  }, [])

  if (!data) return null

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        🔥 Conversion Rate

      </h2>

      <div className="space-y-2 text-gray-700">

        <div>
          Connections: {data.connections}
        </div>

        <div>
          Conversations: {data.conversations}
        </div>

        <div>
          Replies: {data.replies}
        </div>

        <div>
          Meetings: {data.meetings}
        </div>

      </div>

      <div className="mt-4 text-xl font-bold text-purple-600">

        Overall Conversion: {data.conversionRate}%

      </div>

    </div>

  )

}