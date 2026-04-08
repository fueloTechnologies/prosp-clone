'use client'
// src/components/inbox/ConversationList.tsx
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#6B5CE7' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#e0f2fe', text: '#0284c7' },
  { bg: '#f3e8ff', text: '#9333ea' },
]

interface Props {
  conversations: any[]
  selected: any | null
  onSelect: (conv: any) => void
  loading: boolean
}

export default function ConversationList({
  conversations,
  selected,
  onSelect,
  loading,
}: Props) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((conv) => {
    const name = `${conv.contact?.firstName} ${conv.contact?.lastName}`
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const getColor = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const getLastMsgPreview = (conv: any) => {
    const msg = conv.messages?.[0]
    if (!msg) return 'No messages'
    return msg.direction === 'SENT' ? 'You sent a message' : 'You got a reply'
  }

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-surface-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 bg-surface-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ink-tertiary">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">No conversations</p>
          </div>
        )}
        {filtered.map((conv) => {
          const contact = conv.contact
          const color = getColor(contact.firstName)
          const isSelected = selected?.id === conv.id
          const hasUnread = conv.unreadCount > 0

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-border transition-colors ${
                isSelected
                  ? 'bg-brand-50'
                  : 'hover:bg-surface-secondary'
              }`}
            >
              {/* Avatar with online dot */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: color.bg, color: color.text }}
                >
                  {getInitials(`${contact.firstName} ${contact.lastName}`)}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm truncate ${
                      hasUnread ? 'font-bold text-ink' : 'font-semibold text-ink'
                    }`}
                  >
                    {contact.firstName} {contact.lastName}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs truncate mt-0.5 ${
                    hasUnread ? 'text-ink font-medium' : 'text-ink-secondary'
                  }`}
                >
                  {getLastMsgPreview(conv)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
