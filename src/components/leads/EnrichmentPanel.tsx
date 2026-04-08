'use client'
// src/components/leads/EnrichmentPanel.tsx
import { useState } from 'react'
import {
  X,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Linkedin,
  MapPin,
  StickyNote,
  ChevronDown,
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

const SOURCES = [
  { name: 'Prospeo', color: '#ef4444', initial: 'P' },
  { name: 'Dropcontact', color: '#6B5CE7', initial: 'D' },
  { name: 'Findymail', color: '#f97316', initial: 'F' },
  { name: 'Datagma', color: '#3b82f6', initial: 'D' },
]

const STATUS_OPTIONS = [
  'NEW', 'CONTACTED', 'REPLIED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED',
]

interface Props {
  contact: any
  onClose: () => void
  onEnriched: (updated: any) => void
}

export default function EnrichmentPanel({ contact, onClose, onEnriched }: Props) {
  const [enriching, setEnriching] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [notes, setNotes] = useState(contact.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)

  const enrichedData = contact.enrichedData as any

  const enrich = async () => {
    setEnriching(true)
    try {
      const res = await fetch(`/api/contacts/${contact.id}/enrich`, { method: 'POST' })
      const updated = await res.json()
      onEnriched(updated)
    } finally {
      setEnriching(false)
    }
  }

  const updateStatus = async (status: string) => {
    setEditStatus(false)
    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const updated = await res.json()
    onEnriched(updated)
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    const res = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    const updated = await res.json()
    onEnriched(updated)
    setSavingNotes(false)
  }

  const AVATAR_COLORS = [
    { bg: '#ede9fe', text: '#6B5CE7' },
    { bg: '#dcfce7', text: '#16a34a' },
    { bg: '#fef3c7', text: '#d97706' },
    { bg: '#ffe4e6', text: '#e11d48' },
    { bg: '#e0f2fe', text: '#0284c7' },
  ]
  const color = AVATAR_COLORS[contact.firstName.charCodeAt(0) % AVATAR_COLORS.length]

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
        <h3 className="font-semibold text-sm text-ink">Contact Details</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink hover:bg-surface-secondary transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Contact card */}
        <div className="bg-surface-secondary rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: color.bg, color: color.text }}
            >
              {getInitials(`${contact.firstName} ${contact.lastName}`)}
            </div>
            <div>
              <p className="font-bold text-ink">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-sm text-ink-secondary">{contact.position || '—'}</p>
            </div>
          </div>
          {/* Status selector */}
          <div className="relative">
            <button
              onClick={() => setEditStatus(!editStatus)}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-white transition-colors font-medium text-ink-secondary w-full"
            >
              <span className="flex-1 text-left">
                Status: <span className="text-ink">{contact.status}</span>
              </span>
              <ChevronDown size={12} />
            </button>
            {editStatus && (
              <div className="absolute top-9 left-0 right-0 bg-white border border-border rounded-xl shadow-modal py-1 z-20">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-secondary transition-colors ${
                      contact.status === s ? 'font-semibold text-brand-600' : 'text-ink'
                    }`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          {[
            { icon: Mail, label: 'Email', value: contact.email },
            { icon: Phone, label: 'Phone', value: contact.phone },
            { icon: Building2, label: 'Company', value: contact.company },
            { icon: Briefcase, label: 'Position', value: contact.position },
            { icon: MapPin, label: 'Location', value: contact.location },
          ].map(({ icon: Icon, label, value }) =>
            value ? (
              <div key={label} className="flex items-center gap-3 px-1">
                <Icon size={14} className="text-ink-tertiary flex-shrink-0" />
                <div>
                  <p className="text-xs text-ink-tertiary">{label}</p>
                  <p className="text-sm text-ink">{value}</p>
                </div>
              </div>
            ) : null
          )}
          {contact.linkedInUrl && (
            <div className="flex items-center gap-3 px-1">
              <Linkedin size={14} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-ink-tertiary">LinkedIn</p>
                <a
                  href={contact.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline truncate block max-w-[200px]"
                >
                  View profile
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Enrich button */}
        {!contact.enriched && (
          <button
            onClick={enrich}
            disabled={enriching}
            className="btn-primary w-full justify-center"
          >
            {enriching ? (
              <><Loader2 size={14} className="animate-spin" /> Enriching...</>
            ) : (
              <><Zap size={14} /> Enrich Contact</>
            )}
          </button>
        )}

        {/* Data Sources */}
        <div>
          <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-3">
            Data Sources
          </p>
          <div className="space-y-2">
            {SOURCES.map((source) => {
              const result = enrichedData?.results?.find(
                (r: any) => r.source === source.name
              )
              const found = result?.found
              const value = result?.email || result?.phone

              return (
                <div key={source.name} className="enrichment-card">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: source.color }}
                  >
                    {source.initial}
                  </div>
                  <span className="text-sm font-semibold text-ink flex-1">
                    {source.name}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {enriching ? (
                      <Loader2 size={13} className="text-ink-tertiary animate-spin" />
                    ) : found ? (
                      <>
                        <span className="text-xs text-ink-secondary truncate max-w-[110px]">
                          {value}
                        </span>
                        <CheckCircle2 size={14} className="text-green-500" />
                      </>
                    ) : contact.enriched ? (
                      <>
                        <span className="text-xs text-ink-tertiary">Not found</span>
                        <XCircle size={14} className="text-ink-tertiary" />
                      </>
                    ) : (
                      <span className="text-xs text-ink-tertiary">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2">
            Notes
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Add notes about this contact..."
            rows={3}
            className="w-full text-sm border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
          />
          {savingNotes && (
            <p className="text-xs text-ink-tertiary mt-1">Saving...</p>
          )}
        </div>
      </div>
    </div>
  )
}
