"use client";

import { useState } from "react";
import Icon from "./Icon";

// Reads the requirement form fields and fills the "specialNotes" textarea with an AI draft.
export default function AiJobDescription() {
  const [loading, setLoading] = useState(false);

  async function generate() {
    const form = document.querySelector("form");
    if (!form) return;
    const get = (n: string) => (form.querySelector(`[name="${n}"]`) as HTMLInputElement | null)?.value ?? "";
    const profession = get("profession") || get("title");
    if (!profession) { alert("Enter a profession first."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/ai/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, quantity: get("quantity"), location: get("location"), experience: get("experience") }),
      });
      const data = await r.json();
      const ta = form.querySelector('[name="specialNotes"]') as HTMLTextAreaElement | null;
      if (ta && data.text) { ta.value = data.text; ta.focus(); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={generate} disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-brand/10 disabled:opacity-60">
      <Icon name="bolt" className="h-3.5 w-3.5" /> {loading ? "Generating…" : "Generate with AI"}
    </button>
  );
}
