"use client";

import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/dict";

export default function LangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  function set(l: Locale) {
    document.cookie = `locale=${l}; path=/; max-age=31536000`;
    router.refresh();
  }
  return (
    <div className="flex items-center gap-1 rounded-lg border border-navy/15 p-0.5 text-xs">
      {LOCALES.map((l) => (
        <button key={l.code} onClick={() => set(l.code)}
          className={`rounded-md px-2 py-1 font-semibold transition ${current === l.code ? "bg-brand text-white" : "text-navy/60 hover:text-brand"}`}>
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
