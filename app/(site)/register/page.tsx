import Link from "next/link";
import Icon from "@/components/Icon";

export const metadata = { title: "Create Account" };

const options = [
  { kind: "employer", icon: "building", title: "Employer", desc: "Post requirements and hire verified global manpower.", cta: "Sign up as Employer" },
  { kind: "oep", icon: "handshake", title: "Recruitment Partner (OEP)", desc: "Join our licensed partner network and earn on deployments.", cta: "Sign up as Partner" },
  { kind: "candidate", icon: "users", title: "Candidate", desc: "Build your profile and get matched with employers.", cta: "Sign up as Candidate" },
] as const;

export default function RegisterChooser() {
  return (
    <section className="section">
      <div className="container-fp max-w-4xl">
        <div className="text-center">
          <span className="eyebrow">Create account</span>
          <h1 className="mt-2 h2">Join ForcePK</h1>
          <p className="mt-3 text-navy/60">Choose how you want to use ForcePK. You can create a separate account for each role.</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {options.map((o) => (
            <Link key={o.kind} href={`/register/${o.kind}`} className="card card-hover flex flex-col p-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-navy text-white"><Icon name={o.icon} className="h-7 w-7" /></span>
              <h2 className="mt-4 text-lg font-semibold text-navy">{o.title}</h2>
              <p className="mt-2 flex-1 text-sm text-navy/55">{o.desc}</p>
              <span className="btn-primary mt-5 w-full justify-center">{o.cta} <Icon name="arrow" className="h-4 w-4" /></span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-navy/50">
          Already have an account? <Link href="/login" className="font-semibold text-brand">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
