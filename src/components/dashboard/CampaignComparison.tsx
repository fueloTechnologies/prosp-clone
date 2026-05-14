'use client'

import { useEffect, useState } from 'react'

type CampaignData = {
  name: string
  sent: number
  replies: number
  contacts: number
  replyRate: number
}

export default function CampaignComparison() {
  const [data, setData] = useState<CampaignData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/campaign-comparison')
      .then((res) => res.json())
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Campaign comparison fetch error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">
          📊 Campaign Comparison
        </h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">
        📊 Campaign Comparison
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((campaign, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <h3 className="font-semibold text-gray-800 mb-2">
              {campaign.name}
            </h3>

            <p className="text-sm text-gray-600">
              Sent: {campaign.sent}
            </p>

            <p className="text-sm text-gray-600">
              Replies: {campaign.replies}
            </p>

            <p className="text-sm text-gray-600">
              Contacts: {campaign.contacts}
            </p>

            <p className="text-sm font-medium text-purple-600 mt-2">
              Reply Rate: {campaign.replyRate}%
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}