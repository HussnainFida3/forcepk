"use client";

import { useState } from "react";
import { CATEGORY_NAMES, OTHER_OPTION } from "@/lib/categories";

/**
 * Profession picker for the post-requirement forms: a dropdown of the 25
 * manpower categories plus "Other", which reveals a free-text field. The
 * chosen value is always submitted under `name` (default "profession").
 */
export default function ProfessionSelect({
  name = "profession",
  required = true,
  defaultValue = "",
  className = "rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
}: {
  name?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  const presetIsCategory = CATEGORY_NAMES.includes(defaultValue);
  const [sel, setSel] = useState(presetIsCategory ? defaultValue : defaultValue ? OTHER_OPTION : "");
  const [custom, setCustom] = useState(presetIsCategory ? "" : defaultValue);
  const isOther = sel === OTHER_OPTION;

  return (
    <div className="flex flex-col gap-2">
      <select required={required} value={sel} onChange={(e) => setSel(e.target.value)} className={`${className} bg-white`}>
        <option value="">Select a category…</option>
        {CATEGORY_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
        <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
      </select>
      {isOther ? (
        <input name={name} required={required} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Enter the profession" className={className} autoFocus />
      ) : (
        <input type="hidden" name={name} value={sel} />
      )}
    </div>
  );
}
