"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function AiInterviewQuestions({ profession }: { profession: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState<string[]>([]);

  async function load() {
    setOpen(true);
    if (qs.length) return;
    setLoading(true);
    try {
      const r = await fetch("/api/ai/interview-questions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession }),
      });
      const data = await r.json();
      setQs(data.questions ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={open ? () => setOpen(false) : load}
        className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy transition hover:border-brand hover:text-brand">
        <Icon name="bolt" className="h-3.5 w-3.5 text-brand" /> {open ? "Hide questions" : "AI interview questions"}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-navy/10 bg-navy-50 p-3">
          {loading ? <p className="text-xs text-navy/50">Generating…</p> : (
            <ol className="list-inside list-decimal space-y-1 text-xs text-navy/75">
              {qs.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
