"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I register?",
  "What jobs are available?",
  "How does recruitment work?",
  "Contact ForcePK",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const userMsg: Msg = { role: "user", content: trimmed };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with ForcePK Assistant"}
        className="fixed bottom-5 left-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#082952] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )}
        {!open && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-green-400" />}
        {!open && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-400" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-5 z-[60] flex w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl" style={{ height: "min(520px, calc(100vh - 140px))" }}>
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#082952] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">ForcePK Assistant</p>
              <p className="text-[10px] text-white/60">Ask me anything about ForcePK</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 transition hover:bg-white/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welcome */}
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5 text-sm text-gray-800">
                  👋 Hi! I&apos;m ForcePK Assistant. I can help you with registration, finding jobs, understanding our recruitment process, or anything else about ForcePK. How can I help?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-[#082952]/20 px-3 py-1.5 text-xs font-medium text-[#082952] transition hover:bg-[#082952]/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#082952] text-white"
                      : "rounded-tl-sm bg-gray-100 text-gray-800"
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-tl-sm bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#082952] focus:ring-2 focus:ring-[#082952]/10"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#082952] text-white transition hover:bg-[#082952]/90 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg>
              </button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-gray-400">Powered by AI · May not always be accurate</p>
          </div>
        </div>
      )}
    </>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}
