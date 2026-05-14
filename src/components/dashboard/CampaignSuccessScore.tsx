'use client'

import { useEffect, useState } from 'react'

export default function CampaignSuccessScore() {

  const [scores, setScores] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/success-score')
      .then(res => res.json())
      .then(data => setScores(data))

  }, [])

  return (

    <div className="bg-white rounded-xl border p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        ⭐ Campaign Success Score

      </h2>

      <div className="space-y-3">

        {scores
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((c, index) => (

            <div
              key={c.id}
              className="flex items-center justify-between border-b pb-2"
            >

              <div>

                <span className="text-gray-500 mr-2">
                  {index + 1}
                </span>

                {c.name}

              </div>

              <div className="text-purple-600 font-semibold">

                {c.score}%

              </div>

            </div>

          ))}

      </div>

    </div>

  )

}