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

interface Props {
  campaignId?: string
  timeFilter?: string
}

export default function ConnectionsChart({
  campaignId,
  timeFilter = 'month'
}: Props) {

  const [data, setData] =
    useState<any[]>([])

  useEffect(() => {

    let url =
      `/api/dashboard/connections-chart?time=${timeFilter}`

    if (campaignId) {

      url += `&campaignId=${campaignId}`

    }

    fetch(url)
      .then(res => res.json())
      .then(setData)

  }, [campaignId, timeFilter])

  return (

    <div className="bg-white border rounded-xl p-4 h-[300px]">

      <h3 className="font-medium mb-4">

        Connections Over Time

      </h3>

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart data={data}>

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#7c3aed"
            strokeWidth={2}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )

}