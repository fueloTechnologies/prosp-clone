'use client'
// src/components/sequences/CampaignList.tsx
import { Network, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Campaign {
  id: string
  name: string
  status: string
  dailyLimit: number
  totalContacts: number
  _count?: { contacts: number }
}

interface Props {
  campaigns: Campaign[]
  selected: Campaign | null
  onSelect: (c: Campaign) => void
  loading: boolean
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'text-gray-500',
  PENDING: 'text-amber-600',
  ACTIVE: 'text-green-600',
  PAUSED: 'text-orange-500',
  COMPLETED: 'text-blue-600',
}

export default function CampaignList({ campaigns, selected, onSelect, loading }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-surface-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-3xl mb-2">📢</div>
          <p className="text-sm text-ink-secondary">No campaigns yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {campaigns.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c)}
          onMouseEnter={() => setHoveredId(c.id)}
          onMouseLeave={() => setHoveredId(null)}
          className={`p-3 rounded-xl cursor-pointer transition-all group ${
            selected?.id === c.id
              ? 'bg-brand-50 border border-brand-200'
              : 'hover:bg-surface-secondary border border-transparent'
          }`}
        >
          <div className="flex items-start gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                selected?.id === c.id ? 'bg-brand-500' : 'bg-brand-100'
              }`}
            >
              <Network
                size={13}
                className={selected?.id === c.id ? 'text-white' : 'text-brand-600'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium ${STATUS_COLOR[c.status] || 'text-gray-500'}`}>
                  {c.status.charAt(0) + c.status.slice(1).toLowerCase()}
                </span>
                <span className="text-xs text-ink-tertiary">
                  · {c._count?.contacts ?? c.totalContacts} contacts
                </span>
              </div>
              <p className="text-xs text-ink-tertiary mt-0.5">
                {c.dailyLimit}/day limit
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
