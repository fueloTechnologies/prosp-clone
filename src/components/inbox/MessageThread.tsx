"use client";
// src/components/inbox/MessageThread.tsx

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Loader2,
  ChevronRight,
  MoreVertical,
  Linkedin,
  Mail,
} from "lucide-react";
import { useSession } from "next-auth/react";

const AVATAR_COLORS = [
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fef3c7", text: "#b45309" },
  { bg: "#ffe4e6", text: "#be123c" },
  { bg: "#e0f2fe", text: "#0369a1" },
];

function getInitials(first = "", last = "") {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function getColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function formatMsgTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Props {
  conversation: any;
  onMessageSent: (msg: any) => void;
  onToggleContactPanel: () => void;
  showContactPanel: boolean;
}

export default function MessageThread({
  conversation,
  onMessageSent,
  onToggleContactPanel,
  showContactPanel,
}: Props) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const contact = conversation.contact;
  const contactColor = getColor(contact?.firstName || "A");

  useEffect(() => {
    setLoadingMsgs(true);
    setMessages([]);
    fetch(`/api/conversations/${conversation.id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoadingMsgs(false);
      })
      .catch(() => setLoadingMsgs(false));
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const optimistic = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      direction: "SENT",
      content,
      sentAt: new Date().toISOString(),
      aiGenerated: false,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, aiGenerated: false }),
        },
      );
      const real = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? real : m)),
      );
      onMessageSent(real);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const generateAIReply = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/ai/personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactFirstName: contact.firstName,
          contactLastName: contact.lastName,
          contactCompany: contact.company || "",
          contactPosition: contact.position || "",
          purpose: "follow up and move conversation forward",
          channel: "linkedin",
        }),
      });
      const data = await res.json();
      if (data.message) {
        setInput(data.message);
        textareaRef.current?.focus();
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  const senderInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  // Group messages by date
  const groupedMessages: { date: string; msgs: any[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = msg.sentAt
      ? new Date(msg.sentAt).toDateString()
      : "Unknown";
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, msgs: [msg] });
    }
  });

  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-[#ececf4] bg-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: contactColor.bg, color: contactColor.text }}
          >
            {getInitials(contact?.firstName, contact?.lastName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {contact?.firstName} {contact?.lastName}
              </span>
              {contact?.linkedInUrl && (
                <a
                  href={contact.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Linkedin size={13} />
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Mail size={13} />
                </a>
              )}
            </div>
            {contact?.company && (
              <p className="text-xs text-gray-400">
                {contact.position ? `${contact.position} · ` : ""}
                {contact.company}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleContactPanel}
            title={showContactPanel ? "Hide contact info" : "Show contact info"}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showContactPanel
                ? "bg-violet-100 text-violet-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <ChevronRight
              size={15}
              className={`transition-transform ${showContactPanel ? "rotate-0" : "rotate-180"}`}
            />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1 bg-[#fafafe]">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={22} className="text-violet-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-sm font-medium text-gray-600">
              Start the conversation
            </p>
            <p className="text-xs mt-1">
              Write a message below or generate one with AI
            </p>
          </div>
        ) : (
          groupedMessages.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">
                  {formatDateLabel(date)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-4">
                {msgs.map((msg) => {
                  const isSent = msg.direction === "SENT";
                  const isEmail = msg.content?.startsWith("[EMAIL]");

                  // Parse email content
                  let displayContent = msg.content || "";
                  let emailSubject = "";
                  if (isEmail) {
                    const lines = displayContent
                      .replace("[EMAIL] ", "")
                      .split("\n\n");
                    emailSubject = lines[0] || "";
                    displayContent = lines.slice(1).join("\n\n");
                  }

                  return (
                    <div key={msg.id} className="flex gap-3">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                        style={
                          isSent
                            ? { background: "#6d28d9", color: "white" }
                            : {
                                background: contactColor.bg,
                                color: contactColor.text,
                              }
                        }
                      >
                        {isSent
                          ? senderInitials
                          : getInitials(contact?.firstName, contact?.lastName)}
                      </div>

                      {/* Bubble */}
                      <div className="flex-1 max-w-lg">
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {isSent
                              ? session?.user?.name || "You"
                              : `${contact?.firstName} ${contact?.lastName}`}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatMsgTime(msg.sentAt)}
                          </span>
                          {msg.aiGenerated && (
                            <span className="flex items-center gap-1 text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full font-semibold">
                              <Sparkles size={9} /> AI
                            </span>
                          )}
                          {isEmail && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold">
                              <Mail size={9} /> Email
                            </span>
                          )}
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isSent
                              ? "bg-violet-600 text-white rounded-tl-sm"
                              : "bg-white border border-[#ececf4] text-gray-800 rounded-tl-sm shadow-sm"
                          }`}
                        >
                          {isEmail && emailSubject && (
                            <div
                              className={`text-xs font-semibold mb-2 pb-2 border-b ${
                                isSent
                                  ? "border-violet-400 text-violet-200"
                                  : "border-gray-100 text-gray-500"
                              }`}
                            >
                              Subject: {emailSubject}
                            </div>
                          )}
                          {displayContent
                            .split("\n")
                            .map((line: string, i: number) => (
                              <span key={i}>
                                {line}
                                {i < displayContent.split("\n").length - 1 && (
                                  <br />
                                )}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-5 py-4 border-t border-[#ececf4] bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-violet-400 transition-all bg-white">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Write a message… (Enter to send)"
              rows={1}
              className="w-full px-4 pt-3 pb-2 text-sm resize-none focus:outline-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <div className="flex items-center justify-between px-3 pb-2.5">
              <p className="text-[11px] text-gray-400">
                <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">
                  Enter
                </kbd>{" "}
                send ·{" "}
                <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">
                  Shift+Enter
                </kbd>{" "}
                new line
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={generateAIReply}
                  disabled={generatingAI}
                  title="Generate AI reply"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium hover:bg-violet-100 transition-colors disabled:opacity-60"
                >
                  {generatingAI ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  AI Reply
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
