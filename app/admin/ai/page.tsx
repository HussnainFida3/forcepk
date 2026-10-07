"use client";

import { useFormState, useFormStatus } from "react-dom";
import Icon from "@/components/Icon";
import { askAssistant } from "@/lib/mutations";

const suggestions = [
  "Which companies are awaiting verification?",
  "How many partners are active?",
  "Give me a weekly recruitment report",
  "Which requirements are urgent?",
];

export default function AiAssistant() {
  const [state, action] = useFormState(askAssistant, undefined);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-navy text-white"><Icon name="bolt" className="h-6 w-6" /></span>
        <div>
          <h1 className="text-2xl font-bold text-navy">ForcePK AI</h1>
          <p className="text-sm text-navy/60">Ask about your platform. Answers come from your live data.</p>
        </div>
      </div>

      {state?.a && (
        <div className="rounded-2xl bg-navy p-5 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-light">
            <Icon name="bolt" className="h-4 w-4" /> ForcePK AI {state.ai ? "" : "· heuristic mode (add an AI key for free-form answers)"}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/90">{state.a}</p>
          <p className="mt-3 text-xs text-white/40">Q: {state.q}</p>
        </div>
      )}

      <form action={action} className="card p-4">
        <div className="flex items-center gap-2">
          <input name="q" required placeholder="Ask ForcePK AI…" className="flex-1 rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <Ask />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <form key={s} action={action}>
            <input type="hidden" name="q" value={s} />
            <button className="rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70 hover:border-brand hover:text-brand">{s}</button>
          </form>
        ))}
      </div>
    </div>
  );
}

function Ask() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "…" : <Icon name="arrow" className="h-4 w-4" />}</button>;
}
