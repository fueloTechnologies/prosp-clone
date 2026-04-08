'use client'
// src/app/inbox/page.tsx
import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import ConversationList from '@/components/inbox/ConversationList'
import MessageThread from '@/components/inbox/MessageThread'
import AccountSidebar from '@/components/inbox/AccountSidebar'

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeAccount, setActiveAccount] = useState(0)

  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((data) => {
        setConversations(data)
        if (data.length > 0) setSelected(data[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSelect = (conv: any) => {
    setSelected(conv)
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    )
  }

  return (
    <AppShell activeTab="inbox">
      <div className="flex flex-1 overflow-hidden">
        {/* LinkedIn account switcher */}
        <AccountSidebar activeIndex={activeAccount} onSelect={setActiveAccount} />

        {/* Conversation list */}
        <div className="w-72 border-r border-border flex flex-col flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={handleSelect}
            loading={loading}
          />
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <MessageThread
              key={selected.id}
              conversation={selected}
              onMessageSent={(msg: any) => {
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === selected.id
                      ? { ...c, lastMessageAt: new Date().toISOString() }
                      : c
                  )
                )
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-tertiary">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="font-semibold text-ink mb-1">No conversation selected</p>
                <p className="text-sm text-ink-secondary">
                  Pick a conversation from the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
