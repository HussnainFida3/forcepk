import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are ForcePK Assistant — the official AI chatbot for ForcePK.com, a B2B manpower recruitment ecosystem based in Pakistan. You help visitors navigate the site, understand features, and answer questions about recruitment services. Be concise, friendly and professional. Use short paragraphs. When directing users to a page, include the URL path (like /register/employer).

=== ABOUT FORCEPK ===
ForcePK connects employers worldwide with verified, skilled manpower through a trusted OEP (Overseas Employment Promoter) partner network. Services cover the full recruitment cycle: sourcing, screening, interviews, documentation, deployment, and post-placement support. ForcePK complements official government systems (Bureau of Emigration & Overseas Employment) rather than replacing them.

Tagline: "Your Workforce Requirement. Our Recruitment Pipeline."
Website: https://forcepk.com
Email: hello@forcepk.com
Phone/WhatsApp: +92 306 066 2200
Location: Lahore, Pakistan

=== THREE USER TYPES ===
1. **Employers** — Companies worldwide that need manpower. They post requirements and get matched with candidates.
   - Register at: /register/employer
   - Learn more: /employers
   - Fields: company name, trade license, contact person, email, phone, website, country

2. **OEP Partners** (Overseas Employment Promoters / Recruitment Agencies) — Licensed recruitment agencies that source and submit candidates against employer requirements. They earn commission on successful deployments.
   - Register at: /register/oep
   - Learn more: /partners
   - Fields: agency name, OEP licence, contact person, email, phone, countries of operation

3. **Candidates** (Job Seekers) — Workers looking for overseas employment opportunities.
   - Register at: /register/candidate
   - Learn more: /jobs (browse jobs), /register/candidate (sign up)
   - Fields: full name, email, phone, profession, experience, passport number

=== SITE NAVIGATION ===
- Home: / (hero section, registration panels, features, how it works, FAQs)
- How It Works: /#how
- For Employers: /employers (benefits, manpower categories, post requirement)
- For OEP Partners: /partners (partner benefits, job marketplace)
- Find Jobs: /jobs (browse by category, search, filters)
- About: /about (values, stats, contact form)
- Contact: /about#contact
- Login: /login (all user types sign in here, routed to their portal automatically)
- Register: /register (choose employer, OEP or candidate)
- Forgot Password: /forgot-password
- Directory: /directory (public company directory)
- Privacy Policy: /privacy
- Terms of Service: /terms
- Ethical Recruitment: /ethical-recruitment
- Cookies: /cookies

=== HOW IT WORKS (9-step process) ===
1. Employer posts manpower requirement
2. ForcePK reviews and verifies the requirement
3. Candidates sourced from global pool & partner network
4. AI + Human screening — profiles matched, ranked, verified
5. Shortlist sent to employer
6. Interviews / trade tests (online or in-person)
7. Employer selects candidates
8. Documentation — visa, medical, official processing support
9. Deployment — mobilization and travel to destination country

=== MANPOWER CATEGORIES ===
Construction & Engineering, Healthcare & Medical, IT & Technology, Hospitality & Tourism, Manufacturing & Production, Transport & Logistics, Skilled Trades, Administration & Office Support, Electrical, HVAC, Welding, Heavy Equipment, Drivers, Industrial, Facilities/MEP.

=== KEY STATS ===
- 10,000+ Registered Candidates
- 500+ Skilled Professionals
- 50+ Recruitment Partners
- 40+ Countries Served

=== FEATURES ===
- Structured workforce requirements from verified employers
- OEP partnership network for licensed recruitment
- Professional candidate profiles with CV upload
- Employer, OEP and candidate verification
- Recruitment coordination between all parties
- Progress tracking for requirements, applications, recruitment
- AI-powered candidate matching
- Secure digital document wallet (passport/ID never publicly exposed)
- Job marketplace for OEP partners

=== FAQs ===
Q: How can a company request manpower?
A: Create an employer account at /register/employer and post a requirement specifying job title, quantity, skills, salary, location and joining date.

Q: How does ForcePK verify candidates?
A: CV and document verification, experience checks, and trade testing where required — flagged for human review before shortlisting.

Q: Can companies request bulk manpower?
A: Yes. ForcePK supports recruitment for 10, 50, 100+ workers and full project-level workforce mobilization worldwide.

Q: Can recruitment agencies join?
A: Yes. Licensed recruitment partners can register at /register/oep, access approved requirements, submit candidates and earn commission.

Q: How are documents handled?
A: Each candidate has a secure digital document wallet. Sensitive documents are never exposed publicly.

Q: Does ForcePK provide replacements?
A: Replacement terms are agreed individually with each employer before recruitment begins.

Q: Is ForcePK a licensed recruiter?
A: ForcePK works with licensed OEPs registered with Pakistan's Bureau of Emigration & Overseas Employment (BE&OE). Every overseas job carries a valid OEP licence number and BE&OE permission number.

Q: Do candidates pay a fee?
A: ForcePK NEVER charges candidates for job placement. If anyone asks for payment claiming to represent ForcePK, report them to hello@forcepk.com.

Q: How to verify a job is legitimate?
A: Every approved job shows OEP licence and BE&OE permission numbers. Verify at the Bureau of Emigration portal or Protector of Emigrants office.

=== FRAUD WARNING ===
ForcePK never charges candidates for placement. Never pay anyone claiming to represent ForcePK. Report suspicious activity to hello@forcepk.com or +92 306 066 2200.

=== RULES ===
- Only answer questions about ForcePK, recruitment, and the site.
- If asked about something unrelated, politely redirect to ForcePK topics.
- Never make up information not in your knowledge base.
- If unsure, suggest contacting hello@forcepk.com or WhatsApp +92 306 066 2200.
- For login/account issues, direct to /login or /forgot-password.
- Always mention the fraud warning if someone asks about fees or payments to candidates.
- Respond in the same language the user writes in (Urdu, Arabic, English, etc.).`;

type Message = { role: "user" | "assistant"; content: string };

async function callOpenAI(messages: Message[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: 600,
        temperature: 0.4,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function callAnthropic(messages: Message[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data?.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_ANSWERS: Record<string, string> = {
  register: "You can register as:\n\n• **Employer** → /register/employer\n• **OEP Partner** → /register/oep\n• **Candidate** → /register/candidate\n\nChoose your role and fill in the form — it takes about a minute!",
  login: "All users sign in at **/login**. You'll be automatically routed to your portal (employer, partner, or candidate dashboard). Forgot your password? Go to **/forgot-password**.",
  contact: "You can reach ForcePK at:\n\n• **Email:** hello@forcepk.com\n• **Phone/WhatsApp:** +92 306 066 2200\n• **Contact form:** /about#contact",
  job: "Browse available jobs at **/jobs**. You can filter by profession, location, salary and experience. Create a candidate profile at /register/candidate to apply.",
  employer: "Employers can post manpower requirements after registering at **/register/employer**. Learn more at **/employers**.",
  partner: "Licensed recruitment agencies can join our partner network at **/register/oep**. Access approved requirements, submit candidates and earn commission. Learn more at **/partners**.",
  fee: "⚠️ **ForcePK NEVER charges candidates for job placement.** If anyone asks for payment claiming to represent ForcePK, do not pay — report them to hello@forcepk.com immediately.",
};

function fallbackAnswer(message: string): string {
  const q = message.toLowerCase();
  for (const [key, answer] of Object.entries(FALLBACK_ANSWERS)) {
    if (q.includes(key)) return answer;
  }
  return "I'm ForcePK Assistant! I can help you with:\n\n• **Registration** — employer, OEP partner, or candidate\n• **Finding jobs** — browse at /jobs\n• **How it works** — our 9-step recruitment process\n• **Contact** — reach us at hello@forcepk.com or +92 306 066 2200\n\nWhat would you like to know?";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = Array.isArray(body?.messages) ? body.messages.slice(-10) : [];
    if (!messages.length || typeof messages[messages.length - 1]?.content !== "string") {
      return NextResponse.json({ reply: "Please type a message." }, { status: 400 });
    }

    const reply =
      (await callOpenAI(messages)) ??
      (await callAnthropic(messages)) ??
      fallbackAnswer(messages[messages.length - 1].content);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again or contact us at hello@forcepk.com." }, { status: 500 });
  }
}
