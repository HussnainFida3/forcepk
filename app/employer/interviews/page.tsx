import Icon from "@/components/Icon";
import AiInterviewQuestions from "@/components/AiInterviewQuestions";
import { currentUser } from "@/lib/session";
import { getEmployerInterviews } from "@/lib/queries";
import { scheduleInterview, submitInterviewFeedback } from "@/lib/mutations";

export const metadata = { title: "Interviews" };
export const dynamic = "force-dynamic";

export default async function InterviewsPage() {
  const u = await currentUser();
  const { shortlisted, scheduled } = await getEmployerInterviews(u?.companyId ?? undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Interviews</h1>
        <p className="text-sm text-navy/60">Schedule interviews for shortlisted candidates and record outcomes.</p>
      </div>

      {/* Schedule */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="chat" className="h-5 w-5 text-brand" /> Shortlisted — ready to interview</h2>
        <div className="mt-4 space-y-3">
          {shortlisted.length === 0 && <p className="text-sm text-navy/40">No shortlisted candidates awaiting scheduling.</p>}
          {shortlisted.map((a) => (
            <div key={a.id} className="rounded-xl border border-navy/10 p-4">
              <form action={scheduleInterview.bind(null, a.id)} className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <div className="font-medium text-navy">{a.candidate.user.name} <span className="text-xs font-normal text-navy/45">· {a.candidate.profession}</span></div>
                  <div className="text-xs text-navy/45">{a.requirement.refCode} — {a.requirement.title} · AI {a.aiMatch}%</div>
                </div>
                <input type="datetime-local" name="scheduledAt" className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
                <select name="method" className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                  <option>Online</option><option>In-person</option>
                </select>
                <input name="link" placeholder="Meeting link (optional)" className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
                <button className="btn-primary whitespace-nowrap text-xs">Schedule</button>
              </form>
              <div className="mt-3"><AiInterviewQuestions profession={a.candidate.profession ?? "worker"} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled + feedback */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="clock" className="h-5 w-5 text-brand" /> Scheduled interviews</h2>
        <div className="mt-4 space-y-3">
          {scheduled.length === 0 && <p className="text-sm text-navy/40">No interviews scheduled yet.</p>}
          {scheduled.map((iv) => (
            <form key={iv.id} action={submitInterviewFeedback.bind(null, iv.id)} className="flex flex-col gap-3 rounded-xl border border-navy/10 p-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <div className="font-medium text-navy">{iv.application.candidate.user.name}</div>
                <div className="text-xs text-navy/45">
                  {iv.application.requirement.refCode} — {iv.application.requirement.title} · {iv.method}
                  {iv.scheduledAt && ` · ${new Date(iv.scheduledAt).toLocaleString()}`}
                  {iv.link && <> · <a href={iv.link} target="_blank" className="text-brand">join</a></>}
                </div>
              </div>
              <select name="score" className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                <option value="5">Score 5</option><option value="4">Score 4</option><option value="3">Score 3</option><option value="2">Score 2</option><option value="1">Score 1</option>
              </select>
              <select name="outcome" className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                <option value="">Outcome…</option><option value="select">Select</option><option value="reject">Reject</option>
              </select>
              <input name="feedback" placeholder="Notes" className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
              <button className="btn-primary whitespace-nowrap text-xs">Save</button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
