'use client'

import { useEffect, useState } from 'react'

type ReplyTimeData = {
  averageReplyTime: number
  replyCount: number
}

export default function ReplyTimeWidget() {
  const [data, setData] = useState<ReplyTimeData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/reply-time')
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) =>
        console.error('Reply time fetch error:', err)
      )
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">
        ⏱ Reply Time Analytics
      </h2>

      {data ? (
        <div className="space-y-2">
          <p className="text-gray-700">
            Avg Reply Time:{' '}
            <span className="font-semibold text-purple-600">
              {data.averageReplyTime} mins
            </span>
          </p>

          <p className="text-gray-700">
            Replies Analyzed:{' '}
            <span className="font-semibold">
              {data.replyCount}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
  )
}