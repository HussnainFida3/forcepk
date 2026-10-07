// AI layer. Works today with deterministic heuristics; when an AI key is set
// (OpenAI preferred, Anthropic optional), the assistant and generators call the
// real model. No-throw everywhere.

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

type MatchInput = {
  candidate: { profession?: string | null; skills?: string[]; experienceYrs?: number; saudiExpYrs?: number };
  requirement: { profession?: string | null; skills?: string[]; experience?: string | null };
};

// Deterministic match score 0–100 (used for every submission/application).
export function aiMatchScore({ candidate, requirement }: MatchInput): { score: number; skills: number; experience: number } {
  const profMatch = candidate.profession && requirement.profession &&
    candidate.profession.toLowerCase() === requirement.profession.toLowerCase() ? 1 : 0.55;
  const reqSkills = (requirement.skills ?? []).map((s) => s.toLowerCase());
  const candSkills = (candidate.skills ?? []).map((s) => s.toLowerCase());
  const skillOverlap = reqSkills.length ? reqSkills.filter((s) => candSkills.some((c) => c.includes(s) || s.includes(c))).length / reqSkills.length : 0.7;
  const expYrs = candidate.experienceYrs ?? 0;
  const expScore = Math.min(1, expYrs / 5) * 0.8 + Math.min(1, (candidate.saudiExpYrs ?? 0) / 3) * 0.2;

  const skills = Math.round((skillOverlap * 0.7 + profMatch * 0.3) * 100);
  const experience = Math.round(expScore * 100);
  const score = Math.max(60, Math.min(99, Math.round(profMatch * 45 + skillOverlap * 30 + expScore * 25)));
  return { score, skills: Math.max(50, skills), experience: Math.max(40, experience) };
}

async function callOpenAI(system: string, user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: 1024,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

async function callAnthropic(system: string, user: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1024, system, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.content?.[0]?.text ?? null;
  } catch { return null; }
}

// Unified LLM call: OpenAI (GPT) first, Anthropic as optional fallback.
async function callLLM(system: string, user: string): Promise<string | null> {
  return (await callOpenAI(system, user)) ?? (await callAnthropic(system, user));
}

// Parse a CV into structured fields. Heuristic fallback extracts obvious patterns.
export async function parseCV(text: string): Promise<{ ai: boolean; data: Record<string, unknown> }> {
  const llm = await callLLM(
    "You extract structured data from CVs. Reply with compact JSON: {name, email, phone, profession, skills:[], experienceYears, education}.",
    text.slice(0, 8000),
  );
  if (llm) { try { return { ai: true, data: JSON.parse(llm) }; } catch { /* fall through */ } }
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0];
  const phone = text.match(/\+?\d[\d\s-]{7,}\d/)?.[0];
  const years = text.match(/(\d+)\+?\s*years?/i)?.[1];
  return { ai: false, data: { email, phone, experienceYears: years ? Number(years) : undefined } };
}

// Generate a professional job description / requirement brief.
export async function generateJobDescription(input: { profession: string; quantity?: string; location?: string; experience?: string }): Promise<{ ai: boolean; text: string }> {
  const { profession, quantity, location, experience } = input;
  const llm = await callLLM(
    "You write concise, professional manpower recruitment briefs for a global staffing platform. 120-180 words. Include role summary, key responsibilities, requirements, and what the employer offers. No markdown headers, plain paragraphs and short bullet lines.",
    `Profession: ${profession}\nQuantity: ${quantity ?? "—"}\nLocation: ${location ?? "—"}\nExperience: ${experience ?? "—"}`,
  );
  if (llm) return { ai: true, text: llm };
  const q = quantity ? `${quantity} ` : "";
  const text = `We are seeking ${q}experienced ${profession}${quantity && Number(quantity) > 1 ? "s" : ""}${location ? ` for a project in ${location}` : ""}. The ideal candidate has ${experience || "relevant"} experience and a strong safety record.

Responsibilities:
• Perform ${profession.toLowerCase()} duties to the required standard and timeline.
• Follow site safety procedures and quality guidelines.
• Coordinate with supervisors and team members.

Requirements:
• ${experience || "Relevant"} hands-on experience in a similar role.
• Relevant trade certification where applicable; valid passport.
• Ability to work in a multicultural team environment.

We offer:
• Competitive salary, accommodation, transport and food as per contract.
• Medical coverage and end-to-end documentation & mobilization support.`;
  return { ai: false, text };
}

// Generate interview questions for a role.
export async function interviewQuestions(profession: string, experience?: string): Promise<{ ai: boolean; questions: string[] }> {
  const llm = await callLLM(
    "You generate 6 concise interview questions for a trade/technical role. Return ONLY the questions, one per line, no numbering.",
    `Role: ${profession}. Experience level: ${experience ?? "any"}.`,
  );
  if (llm) return { ai: true, questions: llm.split("\n").map((l) => l.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean).slice(0, 8) };
  const p = profession.toLowerCase();
  return {
    ai: false,
    questions: [
      `How many years have you worked as a ${p}, and on what types of projects?`,
      `Walk me through how you approach a typical ${p} task from start to finish.`,
      `What safety procedures do you always follow on site?`,
      `Describe a difficult problem you solved in your ${p} work.`,
      `What tools and equipment are you most experienced with?`,
      `Do you have any certifications relevant to this role? Are your documents and passport ready?`,
    ],
  };
}

// Admin assistant. Answers from supplied platform context; uses the model when available.
export async function assistantAnswer(question: string, context: Record<string, unknown>): Promise<{ ai: boolean; answer: string }> {
  const llm = await callLLM(
    "You are ForcePK AI, an assistant for a recruitment platform owner. Answer concisely using ONLY the JSON context provided. If the answer isn't in the context, say what data would be needed.",
    `Context:\n${JSON.stringify(context)}\n\nQuestion: ${question}`,
  );
  if (llm) return { ai: true, answer: llm };

  // Heuristic fallback: match common questions to the context.
  const q = question.toLowerCase();
  const c = context as Record<string, number | undefined>;
  if (q.includes("verif")) return { ai: false, answer: `There are ${c.pendingCompanies ?? 0} companies awaiting verification.` };
  if (q.includes("overdue") || q.includes("urgent")) return { ai: false, answer: `${c.urgentRequirements ?? 0} requirements need attention and ${c.missingDocs ?? 0} candidates are missing documents.` };
  if (q.includes("electrician") || q.includes("find")) return { ai: false, answer: `There are ${c.candidates ?? 0} candidates in the pool across ${c.openRequirements ?? 0} open requirements. Use the Candidates page filters to shortlist.` };
  if (q.includes("report") || q.includes("week")) return { ai: false, answer: `This period: ${c.applications ?? 0} applications, ${c.selected ?? 0} selected, ${c.deployed ?? 0} deployed. Full export available on the Reports page.` };
  if (q.includes("oep") || q.includes("partner")) return { ai: false, answer: `${c.oeps ?? 0} recruitment partners are active in the network.` };
  return { ai: false, answer: `I can report on companies, partners, candidates, requirements, documents and deployments. Try: "which companies are awaiting verification?" (Connect an AI key for free-form answers.)` };
}
