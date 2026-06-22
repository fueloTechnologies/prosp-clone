"use client";
// src/components/inbox/ConversationList.tsx

import { useState } from "react";
import { Search } from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fef3c7", text: "#b45309" },
  { bg: "#ffe4e6", text: "#be123c" },
  { bg: "#e0f2fe", text: "#0369a1" },
  { bg: "#fce7f3", text: "#9d174d" },
];

function getColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(first = "", last = "") {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function relativeTime(dateStr: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function lastMessagePreview(conv: any) {
  const msg = conv.messages?.[0];
  if (!msg) return "No messages yet";
  const prefix = msg.direction === "SENT" ? "You: " : "";
  const content = msg.content || "";
  // Strip [EMAIL] prefix if present
  const clean = content.replace(/^\[EMAIL\]\s*[^\n]*\n\n/, "");
  return prefix + (clean.length > 55 ? clean.slice(0, 55) + "…" : clean);
}

interface Props {
  conversations: any[];
  selected: any | null;
  onSelect: (conv: any) => void;
  loading: boolean;
}

export default function ConversationList({
  conversations,
  selected,
  onSelect,
  loading,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((conv) => {
    const name = `${conv.contact?.firstName || ""} ${conv.contact?.lastName || ""}`;
    const company = conv.contact?.company || "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || company.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="p-3 space-y-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[68px] bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">No conversations found</p>
          </div>
        )}

        {filtered.map((conv) => {
          const contact = conv.contact;
          const color = getColor(contact?.firstName || "A");
          const isSelected = selected?.id === conv.id;
          const hasUnread = conv.unreadCount > 0;
          const lastMsg = conv.messages?.[0];
          const isReply = lastMsg?.direction === "RECEIVED";

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-[#f4f4f8] transition-colors ${
                isSelected
                  ? "bg-violet-50 border-l-2 border-l-violet-500"
                  : "hover:bg-gray-50 border-l-2 border-l-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0 mt-0.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: color.bg, color: color.text }}
                >
                  {getInitials(contact?.firstName, contact?.lastName)}
                </div>
                {isReply && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-sm truncate ${
                      hasUnread
                        ? "font-bold text-gray-900"
                        : "font-semibold text-gray-800"
                    }`}
                  >
                    {contact?.firstName} {contact?.lastName}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {relativeTime(conv.lastMessageAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <p
                    className={`text-xs truncate ${
                      hasUnread ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    {lastMessagePreview(conv)}
                  </p>
                  {hasUnread && (
                    <span className="flex-shrink-0 w-4 h-4 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>

                {contact?.company && (
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {contact.company}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
