'use client'

import { useEffect, useState } from 'react'

type TimelineItem = {
  id: string
  event: string
  messageCount: number
}

export default function CampaignTimeline() {
  const [data, setData] = useState<
    TimelineItem[]
  >([])

  useEffect(() => {
    fetch('/api/dashboard/timeline')
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) =>
        console.error('Timeline error:', err)
      )
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">
        📅 Campaign Timeline
      </h2>

      <ul className="space-y-3">
       {Array.isArray(data) &&
  data.map((item) => (
          <li
            key={item.id}
            className="border-l-4 border-purple-500 pl-4"
          >
            <p className="font-medium">
              {item.event}
            </p>

            <p className="text-sm text-gray-600">
              Messages: {item.messageCount}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}