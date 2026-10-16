"use client";

import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";

function strongPassword() {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "!@#$%&*?"];
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = sets.map(pick).join("");
  const all = sets.join("");
  while (out.length < 14) out += pick(all);
  return out.split("").sort(() => Math.random() - 0.5).join("");
}

export default function PasswordInput({
  name, label, placeholder = "••••••••", required, minLength, withGenerate, full,
}: {
  name: string; label: string; placeholder?: string; required?: boolean; minLength?: number; withGenerate?: boolean; full?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");

  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="flex items-center justify-between text-xs font-medium text-navy/70">
        <span>{label}{required && " *"}</span>
        {withGenerate && (
          <button type="button" onClick={() => { setVal(strongPassword()); setShow(true); }}
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
            <Sparkles className="h-3 w-3" /> Generate a new password
          </button>
        )}
      </span>
      <div className="flex items-center rounded-lg border border-navy/15 pr-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <input
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full rounded-lg bg-transparent px-3 py-2.5 text-sm outline-none"
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
          className="grid h-7 w-7 place-items-center rounded text-navy/45 hover:text-navy">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
