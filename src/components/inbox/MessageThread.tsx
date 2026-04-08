'use client'
// src/components/inbox/MessageThread.tsx
import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Sparkles,
  Paperclip,
  Mic,
  Loader2,
  Eye,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react'
import { formatTime, getInitials } from '@/lib/utils'
import { useSession } from 'next-auth/react'

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#6B5CE7' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef3c7', text: '#d97706' },
  { bg: '#ffe4e6', text: '#e11d48' },
  { bg: '#e0f2fe', text: '#0284c7' },
]

interface Props {
  conversation: any
  onMessageSent: (msg: any) => void
}

export default function MessageThread({ conversation, onMessageSent }: Props) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const contact = conversation.contact
  const contactColor =
    AVATAR_COLORS[contact.firstName.charCodeAt(0) % AVATAR_COLORS.length]

  // Load messages when conversation changes
  useEffect(() => {
    setLoadingMsgs(true)
    setMessages([])
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : [])
        setLoadingMsgs(false)
      })
      .catch(() => setLoadingMsgs(false))
  }, [conversation.id])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    // Optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      direction: 'SENT',
      content,
      sentAt: new Date().toISOString(),
      aiGenerated: false,
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, aiGenerated: false }),
      })
      const real = await res.json()
      // Replace optimistic with real
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)))
      onMessageSent(real)
    } catch {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  const generateAIReply = async () => {
    setGeneratingAI(true)
    try {
      const res = await fetch('/api/ai/personalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactFirstName: contact.firstName,
          contactLastName: contact.lastName,
          contactCompany: contact.company || '',
          contactPosition: contact.position || '',
          purpose: 'follow up and move conversation forward',
          channel: 'linkedin',
        }),
      })
      const data = await res.json()
      if (data.message) {
        setInput(data.message)
        textareaRef.current?.focus()
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
      }
    } finally {
      setGeneratingAI(false)
    }
  }

  const senderInitials =
    session?.user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'YD'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Thread header ──────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-secondary">Conversation with</span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: contactColor.bg, color: contactColor.text }}
            >
              {getInitials(`${contact.firstName} ${contact.lastName}`)}
            </div>
            <span className="font-bold text-sm text-ink">
              {contact.firstName} {contact.lastName}
            </span>
          </div>
          {contact.company && (
            <span className="text-xs text-ink-tertiary">· {contact.company}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors">
            <Phone size={15} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors">
            <Video size={15} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="text-brand-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Visit event */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-surface-secondary border border-border rounded-full px-4 py-1.5 text-xs text-ink-secondary">
                <Eye size={12} className="text-brand-500" />
                You visited{' '}
                <span className="font-semibold text-ink">
                  {contact.firstName} {contact.lastName}
                </span>
              </div>
            </div>

            {/* Message bubbles */}
            {messages.map((msg, idx) => {
              const isSent = msg.direction === 'SENT'
              return (
                <div
                  key={msg.id}
                  className="flex gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                    style={
                      isSent
                        ? { background: '#6B5CE7', color: 'white' }
                        : { background: contactColor.bg, color: contactColor.text }
                    }
                  >
                    {isSent
                      ? senderInitials
                      : getInitials(`${contact.firstName} ${contact.lastName}`)}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 max-w-xl">
                    {/* Sender + time */}
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-bold text-sm text-ink">
                        {isSent
                          ? session?.user?.name || 'You'
                          : `${contact.firstName} ${contact.lastName}`}
                      </span>
                      <span className="text-xs text-ink-tertiary">
                        {isSent ? 'You sent a message' : 'You got a reply'} at{' '}
                        {formatTime(msg.sentAt)}
                      </span>
                      {msg.aiGenerated && (
                        <span className="flex items-center gap-1 text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full font-semibold">
                          <Sparkles size={9} /> AI
                        </span>
                      )}
                    </div>
                    {/* Bubble */}
                    <div className={isSent ? 'msg-bubble-sent' : 'msg-bubble-received'}>
                      {msg.content.split('\n').map((line: string, i: number, arr: string[]) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {messages.length === 0 && !loadingMsgs && (
              <div className="flex flex-col items-center justify-center h-40 text-ink-tertiary">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-border flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* Textarea */}
          <div className="flex-1 relative border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-400 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-3 text-sm resize-none focus:outline-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            {/* Inline actions */}
            <div className="flex items-center gap-1 px-3 pb-2.5">
              <button
                title="Attach file"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors"
              >
                <Paperclip size={14} />
              </button>
              <button
                title="Voice note"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-tertiary hover:bg-surface-secondary hover:text-ink transition-colors"
              >
                <Mic size={14} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* AI Generate */}
            <button
              onClick={generateAIReply}
              disabled={generatingAI}
              title="Generate AI reply"
              className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors disabled:opacity-60"
            >
              {generatingAI ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
            </button>
            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              title="Send message"
              className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              {sending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-ink-tertiary mt-2 text-center">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-surface-secondary border border-border rounded text-xs font-mono">
            Enter
          </kbd>{' '}
          to send ·{' '}
          <kbd className="px-1.5 py-0.5 bg-surface-secondary border border-border rounded text-xs font-mono">
            Shift+Enter
          </kbd>{' '}
          for new line · Click ✨ for AI reply
        </p>
      </div>
    </div>
  )
}
