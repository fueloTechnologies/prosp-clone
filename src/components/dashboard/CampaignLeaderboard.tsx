'use client'

import { useEffect, useState } from 'react'

export default function CampaignLeaderboard() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/leaderboard')
      .then(res => res.json())
      .then(setData)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mt-4">

      <h2 className="text-lg font-semibold mb-4">
        🏆 Top Campaigns
      </h2>

      <div className="space-y-3">

        {data.slice(0, 5).map((c, i) => (

          <div
            key={c.id}
            className="flex justify-between items-center border-b pb-2"
          >

            <div className="flex items-center gap-3">

              <span className="font-bold text-gray-500">

                {i + 1}

              </span>

              <span>

                {c.name}

              </span>

            </div>

            <span className="font-semibold text-purple-600">

              {c.connections}

            </span>

          </div>

        ))}

      </div>

    </div>

  )

}