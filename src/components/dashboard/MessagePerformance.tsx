'use client'

import { useEffect, useState } from 'react'

export default function MessagePerformance() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/message-performance')
      .then(res => res.json())
      .then(setData)

  }, [])

  if (!data) return null

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        📩 Message Performance

      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">

        <div>
          Messages Sent: {data.messagesSent}
        </div>

        <div>
          Replies Received: {data.replies}
        </div>

        <div>
          Positive Replies: {data.positiveReplies}
        </div>

        <div>
          Negative Replies: {data.negativeReplies}
        </div>

      </div>

      <div className="mt-4 text-purple-600 font-semibold">

        Reply Rate: {data.replyRate}%  
        Positive Rate: {data.positiveRate}%

      </div>

    </div>

  )

}