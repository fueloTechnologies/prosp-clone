'use client'

import { useEffect, useState } from 'react'

export default function ActivityTimeline() {

  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/activity')
      .then(res => res.json())
      .then(data => setActivities(data))

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        📅 Recent Activity

      </h2>

      <div className="space-y-3">

        {activities.map((a, index) => (

          <div
            key={index}
            className="flex items-center justify-between border-b pb-2"
          >

            <div className="text-gray-700">

              {a.text}

            </div>

            <div className="text-sm text-gray-400">

              {new Date(a.date).toLocaleDateString()}

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}