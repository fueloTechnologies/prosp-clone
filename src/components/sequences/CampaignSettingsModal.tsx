'use client'

import { useState } from 'react'

export default function CampaignSettingsModal({
  isOpen,
  onClose,
  campaign,
  onSaved
}: {
  isOpen: boolean
  onClose: () => void
  campaign: any
  onSaved: () => void
}) {

  const [dailyLimit, setDailyLimit] =
    useState(campaign?.dailyLimit || 25)

  const [saving, setSaving] =
    useState(false)

  if (!isOpen) return null

  const saveSettings = async () => {

    try {

      setSaving(true)

      await fetch(
        `/api/campaigns/${campaign.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dailyLimit
          })
        }
      )

      onSaved()
      onClose()

    }

    catch (err) {

      console.error(err)

      alert('Failed to save settings')

    }

    finally {

      setSaving(false)

    }

  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[420px] shadow-xl">

        <h2 className="text-lg font-semibold mb-4">
          Campaign Settings
        </h2>

        {/* DAILY LIMIT */}

        <div className="mb-4">

          <label className="block text-sm font-medium mb-1">

            Daily Message Limit

          </label>

          <input

            type="number"

            min={1}

            value={dailyLimit}

            onChange={(e) =>
              setDailyLimit(
                Number(e.target.value)
              )
            }

            className="w-full border rounded px-3 py-2"

          />

          <p className="text-xs text-gray-500 mt-1">

            Max messages sent per day

          </p>

        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-2">

          <button

            onClick={onClose}

            className="px-4 py-2 text-sm text-gray-600"

          >
            Cancel
          </button>

          <button

            onClick={saveSettings}

            disabled={saving}

            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"

          >
            {saving
              ? 'Saving...'
              : 'Save'}

          </button>

        </div>

      </div>

    </div>

  )

}