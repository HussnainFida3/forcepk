import Link from "next/link";
import { Building2, Users, UserCheck, ArrowRight } from "lucide-react";

export const metadata = { title: "Create Account" };

const ROLES = [
  {
    kind: "employer", Icon: Building2, accent: "#082952",
    title: "Register as an Employer",
    desc: "Submit your company's workforce requirements and connect with suitable recruitment partners.",
    btn: "Register as an Employer",
  },
  {
    kind: "oep", Icon: Users, accent: "#008e8c",
    title: "Register as an OEP Partner",
    desc: "Register your licensed organization, share recruitment capabilities and explore relevant employer requirements.",
    btn: "Register as an OEP",
  },
  {
    kind: "candidate", Icon: UserCheck, accent: "#0968bd",
    title: "Register as a Candidate",
    desc: "Create your profile, upload your CV and explore relevant job opportunities.",
    btn: "Register as a Candidate",
  },
] as const;

export default function RegisterChooser() {
  return (
    <section className="py-14">
      <div className="container-fp max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#082952" }}>
            Join ForcePK
          </h1>
          <p className="mt-2 text-[13px]" style={{ color: "#5e6b7b" }}>
            Choose how you want to use ForcePK. You can create a separate account for each role.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ROLES.map((r) => (
            <article key={r.kind} className="rounded-lg bg-white p-5 flex flex-col" style={{ boxShadow: "0 5px 20px rgba(11,40,64,0.08)" }}>
              <div className="flex items-start gap-4 flex-1">
                <span className="shrink-0 grid place-items-center rounded-full text-white" style={{ background: r.accent, width: 54, height: 54 }}>
                  <r.Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: "#082952" }}>{r.title}</h3>
                  <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "#5e6b7b" }}>{r.desc}</p>
                </div>
              </div>
              <Link href={`/register/${r.kind}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[12px] font-bold text-white"
                style={{ background: r.accent }}>
                {r.btn} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: "#5e6b7b" }}>
          Already have an account? <Link href="/login" className="font-semibold" style={{ color: "#008e8c" }}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}
