'use client'
// src/components/leads/ContactsTable.tsx
import { Mail, Phone, Linkedin, CheckCircle2, MoreHorizontal, Trash2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useState } from 'react'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  NEW: { label: 'New', class: 'bg-gray-100 text-gray-600' },
  CONTACTED: { label: 'Contacted', class: 'bg-blue-100 text-blue-700' },
  REPLIED: { label: 'Replied', class: 'bg-green-100 text-green-700' },
  INTERESTED: { label: 'Interested', class: 'bg-purple-100 text-purple-700' },
  NOT_INTERESTED: { label: 'Not interested', class: 'bg-red-100 text-red-600' },
  CONVERTED: { label: 'Converted', class: 'bg-amber-100 text-amber-700' },
}

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#6B5CE7' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#f3e8ff', text: '#9333ea' },
]

interface Props {
  contacts: any[]
  selected: any | null
  onSelect: (c: any) => void
  loading: boolean
  onUpdated: (c: any) => void
}

export default function ContactsTable({ contacts, selected, onSelect, loading, onUpdated }: Props) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const getAvatarColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const deleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    onUpdated({ id, _deleted: true })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border overflow-hidden p-4 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-surface-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Uploaded banner */}
      {contacts.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-surface-secondary">
          <CheckCircle2 size={14} className="text-brand-500" />
          <span className="text-sm font-semibold text-ink">
            {contacts.length} contacts uploaded
          </span>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="py-20 text-center text-ink-tertiary">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-semibold text-ink mb-1">No contacts yet</p>
          <p className="text-sm">Import a CSV or add contacts manually</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Phone', 'Current position', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-ink-secondary py-3 px-5 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const color = getAvatarColor(c.firstName)
                const badge = STATUS_BADGE[c.status] || STATUS_BADGE.NEW
                const isSelected = selected?.id === c.id

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-50'
                        : 'hover:bg-surface-secondary'
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: color.bg, color: color.text }}
                        >
                          {getInitials(`${c.firstName} ${c.lastName}`)}
                        </div>
                        <span className="text-sm font-semibold text-ink whitespace-nowrap">
                          {c.firstName} {c.lastName}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="py-3 px-5">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-ink-tertiary flex-shrink-0" />
                          <span className="text-sm text-ink">{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-tertiary">—</span>
                      )}
                    </td>
                    {/* Phone */}
                    <td className="py-3 px-5">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-ink-tertiary flex-shrink-0" />
                          <span className="text-sm text-ink whitespace-nowrap">{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-tertiary">—</span>
                      )}
                    </td>
                    {/* Position */}
                    <td className="py-3 px-5">
                      <span className="text-sm text-ink">{c.position || '—'}</span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(menuOpen === c.id ? null : c.id)
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                        {menuOpen === c.id && (
                          <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-modal w-36 py-1 z-20">
                            <button
                              onClick={(e) => deleteContact(c.id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
