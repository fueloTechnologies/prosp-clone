'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export default function ReplyRateChart() {

  const [data, setData] = useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/reply-rate-chart')
      .then(res => res.json())
      .then(setData)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-6">

      <h2 className="text-lg font-semibold mb-4">
        Reply Rate Over Time
      </h2>

      <ResponsiveContainer width="100%" height={250}>

        <LineChart data={data}>

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="rate"
            stroke="#7c3aed"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )

}