'use client'
// src/app/sequences/page.tsx
import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import SequenceBuilder from '@/components/sequences/SequenceBuilder'
import CampaignList from '@/components/sequences/CampaignList'
import { Plus } from 'lucide-react'

export default function SequencesPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(data)
        if (data.length > 0) setSelected(data[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const createCampaign = async () => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Campaign', dailyLimit: 25 }),
    })
    const campaign = await res.json()
    setCampaigns((prev) => [campaign, ...prev])
    setSelected(campaign)
  }

  return (
    <AppShell activeTab="sequences">
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - campaign list */}
        <div className="w-64 border-r border-border flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm text-ink">Campaigns</h2>
            <button
              onClick={createCampaign}
              className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white hover:bg-brand-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <CampaignList
            campaigns={campaigns}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
          />
        </div>

        {/* Right panel - sequence builder */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selected ? (
            <SequenceBuilder
              campaign={selected}
              onUpdate={(updated: any) => {
                setCampaigns((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                )
                setSelected(updated)
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-tertiary">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <p className="font-semibold text-ink mb-1">No campaigns yet</p>
                <p className="text-sm text-ink-secondary mb-4">
                  Create your first outreach campaign
                </p>
                <button onClick={createCampaign} className="btn-primary mx-auto">
                  <Plus size={14} /> New Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
