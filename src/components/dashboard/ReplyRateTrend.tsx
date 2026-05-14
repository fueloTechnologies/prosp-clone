'use client'

import { useEffect, useState } from 'react'

export default function ReplyRateTrend() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/reply-rate-trend')
      .then(res => res.json())
      .then(setData)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        📈 Reply Rate Trend

      </h2>

      <div className="grid grid-cols-7 gap-4 text-center">

        {data.map(d => (

          <div key={d.day}>

            <div className="text-gray-500 text-sm">

              {d.day}

            </div>

            <div className="text-purple-600 font-semibold text-lg">

              {d.replyRate}%

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}