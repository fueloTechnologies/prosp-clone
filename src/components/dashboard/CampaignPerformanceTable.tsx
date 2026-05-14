'use client'

import { useEffect, useState } from 'react'

export default function CampaignPerformanceTable() {

  const [data, setData] =
    useState<any[]>([])

  useEffect(() => {

    fetch('/api/dashboard/campaign-performance')
      .then(res => res.json())
      .then(setData)

  }, [])

  return (

    <div className="bg-white border rounded-xl p-4">

      <h3 className="font-medium mb-4">

        Campaign Performance

      </h3>



      <table className="w-full text-sm">

        <thead>

          <tr className="text-left border-b">

            <th className="py-2">
              Campaign
            </th>

            <th>
              Connections
            </th>

            <th>
              Conversations
            </th>

            <th>
              Reply Rate
            </th>

          </tr>

        </thead>



        <tbody>

          {data.map((row, i) => (

            <tr
              key={i}
              className="border-b"
            >

              <td className="py-2">
                {row.campaignName}
              </td>

              <td>
                {row.connections}
              </td>

              <td>
                {row.conversations}
              </td>

              <td>
                {row.replyRate}%
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}