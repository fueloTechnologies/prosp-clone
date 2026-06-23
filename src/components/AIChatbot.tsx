"use client";
// src/components/AIChatbot.tsx

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, X, Copy, RotateCcw, ChevronDown, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

/* ─── Types ─── */
type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  copied?: boolean;
}

/* ─── Constants ─── */
const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content: "👋 Hey! I'm **Lin-C AI**, your LinkedIn outreach expert.\n\nI can write cold DMs, follow-up sequences, cold emails, icebreakers, and help you book more meetings. What do you need?",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  { label: "Cold DM", prompt: "Write a cold LinkedIn DM to a VP of Sales at a B2B SaaS company" },
  { label: "Follow-up sequence", prompt: "Write a 3-step LinkedIn follow-up sequence for a prospect who didn't reply" },
  { label: "Improve my message", prompt: "Rewrite this LinkedIn message to get more replies: [paste your message]" },
  { label: "Cold email", prompt: "Write a cold email with subject line to a startup founder about LinkedIn outreach automation" },
  { label: "Icebreaker", prompt: "Write a personalised icebreaker for a prospect named Alex who is Head of Growth at Notion" },
  { label: "Connection request", prompt: "Write a LinkedIn connection request note (under 300 chars) to a marketing director" },
];

const THINKING_PHRASES = [
  "Crafting your message…",
  "Personalising outreach…",
  "Optimising for replies…",
  "Thinking like a top SDR…",
  "Writing something sharp…",
];

/* ─── Helpers ─── */
const uid = () => Math.random().toString(36).slice(2);
const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState(THINKING_PHRASES[0]);
  const [unread, setUnread] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thinkingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* scroll to bottom */
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    if (open) { scrollToBottom(false); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open, scrollToBottom]);

  useEffect(() => {
    if (open) scrollToBottom();
    else if (messages.length > 1) setUnread(prev => prev + 1);
  }, [messages, open, scrollToBottom]);

  /* scroll detection */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* rotating thinking text */
  useEffect(() => {
    if (loading) {
      let i = 0;
      thinkingRef.current = setInterval(() => {
        i = (i + 1) % THINKING_PHRASES.length;
        setThinkingText(THINKING_PHRASES[i]);
      }, 1800);
    } else {
      if (thinkingRef.current) clearInterval(thinkingRef.current);
    }
    return () => { if (thinkingRef.current) clearInterval(thinkingRef.current); };
  }, [loading]);

  /* send */
  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { id: uid(), role: "user", content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build history (exclude initial greeting)
    const history = messages
      .filter(m => m.id !== "init")
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: "❌ Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  /* copy message */
  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* retry last */
  const retryLast = () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (lastUser) {
      setMessages(prev => prev.slice(0, -1));
      send(lastUser.content);
    }
  };

  /* clear chat */
  const clearChat = () => setMessages([INITIAL_MESSAGE]);

  const W = expanded ? 520 : 380;
  const H = expanded ? 680 : 560;

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 9999,
          width: 60, height: 60, borderRadius: 18,
          background: "linear-gradient(145deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 0 rgba(139,92,246,0.4), 0 8px 32px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
          animation: !open ? "pulse-ring 2.8s ease-out infinite" : undefined,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1) translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 0 0 0 rgba(139,92,246,0.4), 0 16px 40px rgba(109,40,217,0.65), inset 0 1px 0 rgba(255,255,255,0.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 0 0 0 rgba(139,92,246,0.4), 0 8px 32px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
        }}
        aria-label="Open AI Assistant"
      >
        {open ? (
          /* Close X */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        ) : (
          /* Premium chat bubble icon */
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            {/* Outer bubble */}
            <path
              d="M4 6.5C4 4.567 5.567 3 7.5 3h13C22.433 3 24 4.567 24 6.5v10c0 1.933-1.567 3.5-3.5 3.5H16l-4 4-1-4H7.5C5.567 20 4 18.433 4 16.5V6.5z"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.2"
            />
            {/* Typing dots */}
            <circle cx="10" cy="11.5" r="1.5" fill="white" opacity="0.9"/>
            <circle cx="14" cy="11.5" r="1.5" fill="white" opacity="0.9"/>
            <circle cx="18" cy="11.5" r="1.5" fill="white" opacity="0.9"/>
            {/* Top-right sparkle accent */}
            <circle cx="22" cy="5" r="3.5" fill="#f0abfc"/>
            <path d="M22 3.2v3.6M20.2 5h3.6" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        )}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            minWidth: 20, height: 20, borderRadius: 10,
            background: "#ef4444", border: "2px solid #04071a",
            fontSize: 10, fontWeight: 800, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, left: 24, zIndex: 9998,
          width: W, height: H,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "#070d1f",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.15), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(109,40,217,0.15)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', system-ui, sans-serif",
          animation: "slideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
          transition: "width 0.25s, height 0.25s",
        }}>

          {/* ── Header ── */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Sparkles size={18} color="white" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Lin-C AI</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", display: "inline-block" }} />
                LinkedIn outreach expert · Always on
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <HeaderBtn onClick={() => setExpanded(e => !e)} title={expanded ? "Compact" : "Expand"}>
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </HeaderBtn>
              <HeaderBtn onClick={clearChat} title="Clear chat">
                <RotateCcw size={14} />
              </HeaderBtn>
              <HeaderBtn onClick={() => setOpen(false)} title="Close">
                <X size={14} />
              </HeaderBtn>
            </div>
          </div>

          {/* ── Quick prompts (shown only at start) ── */}
          {messages.length === 1 && (
            <div style={{
              padding: "12px 14px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Try asking
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK_PROMPTS.map(q => (
                  <button
                    key={q.label}
                    onClick={() => send(q.prompt)}
                    style={{
                      fontSize: 11, padding: "5px 10px", borderRadius: 20,
                      border: "1px solid rgba(139,92,246,0.3)",
                      background: "rgba(139,92,246,0.08)",
                      color: "#c4b5fd", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.18)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}
          >
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                copied={copiedId === msg.id}
                onCopy={() => copyMessage(msg.id, msg.content)}
                onRetry={i === messages.length - 1 && msg.role === "assistant" && messages.length > 1 ? retryLast : undefined}
                isLast={i === messages.length - 1}
              />
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={13} color="#a78bfa" />
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "4px 16px 16px 16px", padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <ThinkingDots />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>{thinkingText}</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Scroll-to-bottom button */}
          {showScrollBtn && (
            <button
              onClick={() => scrollToBottom()}
              style={{
                position: "absolute", bottom: 76, left: "50%", transform: "translateX(-50%)",
                background: "rgba(109,40,217,0.85)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20, padding: "5px 12px",
                color: "white", fontSize: 11, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                backdropFilter: "blur(8px)",
              }}
            >
              <ChevronDown size={13} /> Latest
            </button>
          )}

          {/* ── Input ── */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.25)",
            flexShrink: 0,
          }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16, padding: "8px 10px 8px 14px",
              transition: "border-color 0.2s",
            }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask anything about LinkedIn outreach…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                disabled={loading}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "white", fontSize: 13, lineHeight: "1.5",
                  resize: "none",
                }}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: "none",
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #6d28d9, #a855f7)"
                    : "rgba(255,255,255,0.06)",
                  color: input.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  flexShrink: 0, transition: "all 0.18s",
                  boxShadow: input.trim() && !loading ? "0 4px 14px rgba(109,40,217,0.4)" : "none",
                }}
              >
                <Send size={15} />
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
              Powered by Lin-C · Groq LLaMA 3.3 70B
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.5), 0 8px 32px rgba(109,40,217,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(139,92,246,0), 0 8px 32px rgba(109,40,217,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0), 0 8px 32px rgba(109,40,217,0.5); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        /* Markdown styles inside chat */
        .lc-md p { margin: 0 0 8px; line-height: 1.6; }
        .lc-md p:last-child { margin-bottom: 0; }
        .lc-md ul, .lc-md ol { margin: 6px 0; padding-left: 18px; }
        .lc-md li { margin-bottom: 4px; line-height: 1.55; }
        .lc-md strong { font-weight: 700; color: inherit; }
        .lc-md code { background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
        .lc-md pre { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px 12px; overflow-x: auto; margin: 8px 0; }
        .lc-md h1,.lc-md h2,.lc-md h3 { margin: 10px 0 6px; font-weight: 700; }
        /* Scrollbar */
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
      `}</style>
    </>
  );
}

/* ─── MessageBubble ─── */
function MessageBubble({
  msg, copied, onCopy, onRetry, isLast,
}: {
  msg: Message;
  copied: boolean;
  onCopy: () => void;
  onRetry?: () => void;
  isLast: boolean;
}) {
  const isUser = msg.role === "user";
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: 8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
          background: "rgba(139,92,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={13} color="#a78bfa" />
        </div>
      )}

      <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* Bubble */}
        <div style={{
          padding: "10px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser
            ? "linear-gradient(135deg, #5b21b6, #7c3aed)"
            : "rgba(255,255,255,0.05)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
          color: "white",
          fontSize: 13,
          lineHeight: 1.6,
          boxShadow: isUser ? "0 4px 16px rgba(109,40,217,0.3)" : "none",
        }}>
          <div className="lc-md">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{fmt(msg.timestamp)}</span>

          {!isUser && (
            <>
              <ActionBtn onClick={onCopy} title={copied ? "Copied!" : "Copy"}>
                {copied ? "✓" : <Copy size={11} />}
              </ActionBtn>
              {onRetry && (
                <ActionBtn onClick={onRetry} title="Regenerate">
                  <RotateCcw size={11} />
                </ActionBtn>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ThinkingDots ─── */
function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "#a78bfa",
          display: "inline-block",
          animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─── Micro components ─── */
function HeaderBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 8, border: "none",
        background: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "white"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
    >
      {children}
    </button>
  );
}

function ActionBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontSize: 10, padding: "3px 7px", borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.4)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
        transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
    >
      {children}
    </button>
  );
}