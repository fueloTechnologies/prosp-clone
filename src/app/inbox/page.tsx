"use client";
// src/app/inbox/page.tsx

import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import ConversationList from "@/components/inbox/ConversationList";
import MessageThread from "@/components/inbox/MessageThread";
import ContactPanel from "@/components/inbox/ContactPanel";

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showContactPanel, setShowContactPanel] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");

  const loadInbox = useCallback(
    async (quiet = false) => {
      try {
        if (!quiet) setLoading(true);
        const res = await fetch("/api/inbox");
        const data = await res.json();
        if (!Array.isArray(data)) return;

        setConversations(data);

        // Keep selected synced on refresh
        if (selected) {
          const updated = data.find((c: any) => c.id === selected.id);
          if (updated) setSelected(updated);
        } else if (data.length > 0) {
          setSelected(data[0]);
        }
      } catch (err) {
        console.error("Inbox load failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [selected],
  );

  useEffect(() => {
    loadInbox();
    const interval = setInterval(() => loadInbox(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = async (conv: any) => {
    setSelected(conv);
    // Mark as read
    try {
      await fetch(`/api/conversations/${conv.id}/read`, { method: "POST" });
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
      );
    } catch {}
  };

  const handleMessageSent = (msg: any) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected?.id
          ? {
              ...c,
              messages: [msg, ...(c.messages || [])],
              lastMessageAt: msg.sentAt,
            }
          : c,
      ),
    );
  };

  // Filter conversations
  const filtered = conversations.filter((c) => {
    if (filter === "unread") return c.unreadCount > 0;
    if (filter === "replied") return c.messages?.[0]?.direction === "RECEIVED";
    return true;
  });

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  return (
    <AppShell activeTab="inbox">
      <div className="flex h-full overflow-hidden bg-[#fafafe]">
        {/* ── LEFT: Conversation list ─────────────────────────── */}
        <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-[#ececf4] bg-white">
          {/* Header */}
          <div className="px-5 pt-5 pb-3 border-b border-[#ececf4]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
                {totalUnread > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {totalUnread} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  {conversations.length} total
                </span>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "replied", label: "Replied" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === f.id
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                  {f.id === "unread" && totalUnread > 0 && (
                    <span className="ml-1.5 bg-white/30 text-white rounded-full px-1.5 text-[10px]">
                      {totalUnread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <ConversationList
            conversations={filtered}
            selected={selected}
            onSelect={handleSelect}
            loading={loading}
          />
        </div>

        {/* ── CENTER: Message thread ──────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <MessageThread
              conversation={selected}
              onMessageSent={handleMessageSent}
              onToggleContactPanel={() => setShowContactPanel((v) => !v)}
              showContactPanel={showContactPanel}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-semibold text-gray-600">
                Select a conversation
              </p>
              <p className="text-sm mt-1">Choose from the list on the left</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Contact panel ────────────────────────────── */}
        {selected && showContactPanel && (
          <div className="w-[260px] flex-shrink-0 border-l border-[#ececf4] bg-white overflow-y-auto">
            <ContactPanel contact={selected.contact} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
