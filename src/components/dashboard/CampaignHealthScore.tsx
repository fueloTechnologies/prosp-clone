'use client'

import { useEffect, useState } from 'react'

export default function CampaignHealthScore() {

  const [data, setData] =
    useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/campaign-health')
      .then(res => res.json())
      .then(setData)

  }, [])

  if (!data) return null

  let color = 'text-red-500'

  if (data.status === 'Healthy')
    color = 'text-green-600'

  else if (data.status === 'Moderate')
    color = 'text-yellow-600'

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        ⭐ Campaign Health Score

      </h2>

      <div className="flex items-center justify-between">

        <div>

          <div className="text-4xl font-bold text-purple-600">

            {data.healthScore}%

          </div>

          <div className={`font-semibold ${color}`}>

            {data.status}

          </div>

        </div>

      </div>

    </div>

  )

}