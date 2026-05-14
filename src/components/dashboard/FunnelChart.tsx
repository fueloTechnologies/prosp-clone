'use client'

import { useEffect, useState } from 'react'

export default function FunnelChart() {

  const [data, setData] = useState<any>(null)

  useEffect(() => {

    fetch('/api/dashboard/funnel')
      .then(res => res.json())
      .then(setData)

  }, [])

  if (!data) return null

  const stages = [

    { label: 'Connections', value: data.connections },
    { label: 'Conversations', value: data.conversations },
    { label: 'Replies', value: data.replies },
    { label: 'Meetings', value: data.meetings }

  ]

  /* Use fixed funnel proportions */

  const widths = [100, 75, 50, 30]

  return (

    <div className="bg-white border rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-6">
        Campaign Funnel
      </h2>

      <div className="flex flex-col items-center gap-4 w-full">

        {stages.map((stage, i) => (

          <div
            key={i}
            className="flex justify-center w-full"
          >

            <div
              style={{
                width: `${widths[i]}%`
              }}
              className="
                bg-gradient-to-r
                from-purple-500
                to-purple-700
                text-white
                text-sm
                py-3
                rounded-md
                text-center
                shadow
              "
            >

              {stage.label}: {stage.value}

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}