'use client'

import { useEffect, useState } from 'react'

export default function LeadStatusDistribution() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    async function loadLeadStatus() {

      try {

        const res =
          await fetch('/api/dashboard/lead-status')

        // 🔥 Handle bad response
        if (!res.ok) {

          console.error(
            'Lead-status API failed:',
            res.status
          )

          setData([])
          return

        }

        const text =
          await res.text()

        // 🔥 Fix empty JSON crash
        if (!text) {

          setData([])
          return

        }

        const parsed =
          JSON.parse(text)

        // 🔥 Ensure it's an array
        if (Array.isArray(parsed)) {

          setData(parsed)

        } else {

          console.warn(
            'Lead-status not array:',
            parsed
          )

          setData([])

        }

      }

      catch (err) {

        console.error(
          'Lead-status fetch error:',
          err
        )

        setData([])

      }

    }

    loadLeadStatus()

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6 mb-6">

      <h2 className="text-lg font-semibold mb-4">

        📊 Lead Status Distribution

      </h2>

      <div className="space-y-3">

        {data.length === 0 ? (

          <p className="text-gray-400">
            No lead data available
          </p>

        ) : (

          data.map(d => (

            <div
              key={d.status}
              className="flex justify-between"
            >

              <span>

                {d.status}

              </span>

              <span className="text-purple-600 font-semibold">

                {d.count}

              </span>

            </div>

          ))

        )}

      </div>

    </div>

  )

}