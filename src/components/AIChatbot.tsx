"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hey! How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const currentMessage = message.trim();

    if (!currentMessage || loading) return;

    // Add user message instantly
    setMessages((prev: any) => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
      },
    ]);

    // Clear input
    setMessage("");

    // Start loading
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: currentMessage,
        }),
      });

      const data = await res.json();

      console.log(data);

      // Add AI reply
      setMessages((prev: any) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            data.choices?.[0]?.message?.content ||
            "No response generated.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev: any) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Failed to generate response.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-2xl flex items-center justify-center hover:scale-105 transition"
      >
        <img src="/guide/bot.png" alt="AI" className="w-7 h-7 rounded-full" />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[370px] h-[560px] rounded-3xl border border-white/10 bg-[#081120] shadow-[0_0_50px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
            <div>
              <h2 className="font-semibold text-lg">AI Assistant</h2>

              <p className="text-xs opacity-80">Online now</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg hover:opacity-70"
            >
              ✕
            </button>
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pt-4 flex flex-wrap gap-2">
              {[
                "Write a cold DM",
                "Generate follow-up message",
                "Improve reply rates",
                "Create outreach sequence",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg: any, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-br-md"
                      : "bg-white/10 text-white rounded-bl-md"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white px-4 py-2 rounded-2xl text-sm animate-pulse">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0B1120]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2"
            >
              <input
                type="text"
                placeholder="Ask anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
