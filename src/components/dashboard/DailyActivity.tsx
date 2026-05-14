'use client'

import { useEffect, useState } from 'react'

export default function DailyActivity() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/daily-activity')
      .then(res => res.json())
      .then(setData)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      {/* Daily Activity Title */}

      <h2 className="text-lg font-semibold mb-4">

        📅 Daily Outreach Activity

      </h2>

      {/* Days Grid */}

      <div className="grid grid-cols-7 gap-4 text-center">

        {data.map(d => (

          <div key={d.day}>

            {/* Day Name */}

            <div className="text-gray-500 text-sm">

              {d.day}

            </div>

            {/* Count */}

            <div className="text-purple-600 font-semibold text-lg">

              {d.count}

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}