"use client";

import { useState } from "react";
import Icon from "./Icon";

export default function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="font-semibold text-navy">{q}</span>
        <Icon name="chevron" className={`h-5 w-5 shrink-0 text-brand transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="border-t border-navy/10 p-5 pt-4 text-sm text-navy/65">{a}</p>}
    </div>
  );
}
