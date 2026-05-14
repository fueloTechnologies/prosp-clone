'use client'

import { Loader2 } from 'lucide-react'

interface Props {
  campaigns: any
  selected: any
  onSelect: (c: any) => void
  loading?: boolean
}

export default function CampaignList({
  campaigns,
  selected,
  onSelect,
  loading
}: Props) {

  // Always ensure campaigns is an array

  const safeCampaigns =
    Array.isArray(campaigns)
      ? campaigns
      : []

  return (

    <div className="flex-1 overflow-y-auto p-3 space-y-2">

      {/* Loading */}

      {loading && (

        <div className="flex items-center justify-center py-6">

          <Loader2
            size={16}
            className="animate-spin"
          />

        </div>

      )}

      {/* Empty State */}

      {!loading && safeCampaigns.length === 0 && (

        <div className="text-center text-sm text-gray-500 py-6">

          No campaigns yet

        </div>

      )}

      {/* Campaign List */}

      {safeCampaigns.map((c: any, index: number) => (

        <div
          key={c?.id ?? `campaign-${index}`}
          onClick={() => onSelect(c)}
          className={`p-3 rounded-xl cursor-pointer border transition
            ${
              selected?.id === c?.id
                ? 'bg-brand-50 border-brand-300'
                : 'hover:bg-gray-50 border-transparent'
            }
          `}
        >

          {/* Campaign Name */}

          <div className="font-medium text-sm">

            {c?.name || 'Untitled Campaign'}

          </div>

          {/* Campaign Info */}

          <div className="text-xs text-gray-500 mt-1">

            {c?.status || 'Draft'}
            {' • '}
            {c?.totalContacts ??
             c?._count?.contacts ??
             0} contacts

          </div>

        </div>

      ))}

    </div>

  )

}