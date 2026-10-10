"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Icon from "@/components/Icon";
import { runAgentAction, type AgentState } from "./actions";

const AGENTS = [
  {
    key: "leadgen",
    label: "Lead Generation",
    icon: "users",
    tone: "from-brand to-brand-dark",
    blurb: "Finds real businesses from public sources and saves them as CRM leads.",
    examples: [
      "Find 10 construction companies in Dubai that hire overseas labour and add them as leads",
      "Get 5 facilities-management firms in Qatar and save them with contact info",
      "Research staffing agencies in Saudi Arabia hiring technicians and add the best 8 as leads",
    ],
  },
  {
    key: "ops",
    label: "Operations",
    icon: "gear",
    tone: "from-navy to-navy-900",
    blurb: "Full control of the platform — create/update/verify records, run analytics.",
    examples: [
      "Verify all companies that are currently pending",
      "How many leads are in each stage right now?",
      "Create a requirement for 20 electricians in Dubai for the newest verified company",
    ],
  },
  {
    key: "outreach",
    label: "Outreach & Email",
    icon: "chat",
    tone: "from-blue-500 to-blue-700",
    blurb: "Drafts and sends professional B2B emails to your leads, then updates their stage.",
    examples: [
      "Email all NEW leads a short intro to ForcePK and mark them contacted",
      "Write and send a follow-up to leads in the PROPOSAL stage",
    ],
  },
] as const;

export default function AiAgents() {
  const [persona, setPersona] = useState<string>("leadgen");
  const [command, setCommand] = useState("");
  const [state, action] = useFormState(runAgentAction, undefined as AgentState);
  const active = AGENTS.find((a) => a.key === persona)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-navy text-white"><Icon name="bolt" className="h-6 w-6" /></span>
        <div>
          <h1 className="text-2xl font-bold text-navy">ForcePK AI Agents</h1>
          <p className="text-sm text-navy/60">Autonomous agents that act on your platform — CRUD, email, and lead generation.</p>
        </div>
      </div>

      {/* Agent picker */}
      <div className="grid gap-4 md:grid-cols-3">
        {AGENTS.map((a) => {
          const selected = a.key === persona;
          return (
            <button key={a.key} type="button" onClick={() => setPersona(a.key)}
              className={`card p-5 text-left transition ${selected ? "ring-2 ring-brand" : "hover:shadow-md"}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${a.tone} text-white`}><Icon name={a.icon} className="h-5 w-5" /></span>
                <h2 className="font-semibold text-navy">{a.label}</h2>
                {selected && <Icon name="check-circle" className="ml-auto h-5 w-5 text-brand" />}
              </div>
              <p className="mt-3 text-sm text-navy/55">{a.blurb}</p>
            </button>
          );
        })}
      </div>

      {/* Command console */}
      <form action={action} className="card p-5">
        <input type="hidden" name="persona" value={persona} />
        <label className="text-xs font-semibold uppercase tracking-wide text-navy/50">Command the {active.label} agent</label>
        <textarea
          name="command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          rows={3}
          placeholder={`e.g. ${active.examples[0]}`}
          className="mt-2 w-full resize-y rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {active.examples.map((ex) => (
              <button key={ex} type="button" onClick={() => setCommand(ex)} className="rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/60 transition hover:border-brand hover:text-brand">
                {ex.length > 46 ? ex.slice(0, 46) + "…" : ex}
              </button>
            ))}
          </div>
          <RunButton label={active.label} />
        </div>
      </form>

      {/* Result */}
      {state && <AgentOutput state={state} />}

      <p className="flex items-center gap-2 text-xs text-navy/40">
        <Icon name="shield" className="h-4 w-4" />
        Agents act with your admin authority and only touch this platform's data and email. The lead agent searches public business listings — it never accesses anything behind a login.
      </p>
    </div>
  );
}

function RunButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary shrink-0 disabled:opacity-60">
      {pending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Working…</> : <><Icon name="bolt" className="h-4 w-4" /> Run {label}</>}
    </button>
  );
}

function AgentOutput({ state }: { state: NonNullable<AgentState> }) {
  const stepIcon = (k: string) => (k === "search" ? "search" : k === "text" ? "chat" : "check-circle");
  return (
    <div className="space-y-4">
      {/* Activity timeline */}
      {state.steps.length > 0 && (
        <div className="card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-navy"><Icon name="clock" className="h-4 w-4 text-brand" /> Agent activity</h3>
          <div className="mt-4 space-y-3">
            {state.steps.map((st, i) => (
              <div key={i} className="flex gap-3">
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${st.kind === "tool" && !(st as { ok?: boolean }).ok ? "bg-red-100 text-red-600" : "bg-brand/10 text-brand-dark"}`}>
                  <Icon name={stepIcon(st.kind)} className="h-4 w-4" />
                </span>
                <div className="min-w-0 pt-1 text-sm">
                  {st.kind === "tool" && <span className="text-navy/80"><span className="font-mono text-xs text-navy/50">{st.name}</span> — {st.summary}</span>}
                  {st.kind === "search" && <span className="text-navy/80">Searched the web: <span className="text-navy/55">“{st.query}”</span></span>}
                  {st.kind === "text" && <span className="text-navy/60">{st.text}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final answer */}
      <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${state.ok ? "bg-navy" : "bg-red-600"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_0%,rgba(34,197,94,0.25),transparent)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-light">
            <Icon name="bolt" className="h-4 w-4" /> ForcePK AI {state.ai ? "" : "· not connected"}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/90">{state.answer}</p>
        </div>
      </div>
    </div>
  );
}
