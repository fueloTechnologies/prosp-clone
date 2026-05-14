'use client'

import { useEffect, useState } from 'react'

export default function MeetingConversionRate() {

  const [data, setData] =
    useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/meeting-conversion')
      .then(res => res.json())
      .then(setData)

  }, [])

  if (!data) return null

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        📅 Meeting Conversion Rate

      </h2>

      <div className="space-y-2">

        <div>

          Replies:
          <span className="font-semibold ml-2">

            {data.replies}

          </span>
        </div>

        <div>

          Meetings:
          <span className="font-semibold ml-2">

            {data.meetings}

          </span>
        </div>

        <div className="text-purple-600 font-bold text-xl">

          {data.conversionRate}% Conversion

        </div>

      </div>

    </div>

  )

}