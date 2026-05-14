'use client'

import { useEffect, useState } from 'react'

export default function CampaignAlerts() {

  const [alerts, setAlerts] = useState<string[]>([])

  useEffect(() => {

    async function loadAlerts() {

      try {

        const res =
          await fetch('/api/dashboard/campaign-alerts')

        if (!res.ok) {
          console.error(
            'API failed:',
            res.status
          )
          setAlerts([])
          return
        }

        const text =
          await res.text()

        // 🔥 Fix empty JSON crash
        if (!text) {
          setAlerts([])
          return
        }

        const data =
          JSON.parse(text)

        // 🔥 Ensure it's always an array
        if (Array.isArray(data)) {
          setAlerts(data)
        } else {
          console.warn(
            'Alerts not array:',
            data
          )
          setAlerts([])
        }

      }

      catch (err) {

        console.error(
          'Alerts fetch error:',
          err
        )

        setAlerts([])

      }

    }

    loadAlerts()

  }, [])

  return (

    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">

      <h2 className="text-lg font-semibold mb-4">
        🚨 Campaign Alerts
      </h2>

      {alerts.length === 0 ? (

        <p className="text-green-600">
          ✅ No alerts — All campaigns healthy
        </p>

      ) : (

        <ul className="space-y-2">

          {alerts.map((alert, index) => (

            <li
              key={index}
              className="text-red-600 font-medium"
            >
              {alert}
            </li>

          ))}

        </ul>

      )}

    </div>

  )

}