import Link from "next/link";
import Icon from "@/components/Icon";
import { CATEGORY_NAMES } from "@/lib/categories";
import { currentUser } from "@/lib/session";

export const metadata = { title: "Hire Verified Global Manpower" };

const benefits = [
  ["shield", "Access to verified global talent"],
  ["clock", "Save time & recruitment costs"],
  ["users", "AI-powered candidate matching"],
  ["doc", "End-to-end recruitment support"],
  ["handshake", "Trusted recruitment partner network"],
  ["check-circle", "Secure & transparent process"],
];

export default async function EmployersPage() {
  const u = await currentUser();
  const isEmployer = !!u?.role && u.role.startsWith("EMPLOYER");

  return (
    <>
      {/* Page heading */}
      <section className="border-b border-navy/10 bg-navy-50 py-12">
        <div className="container-fp max-w-3xl text-center">
          <span className="eyebrow">For Employers</span>
          <h1 className="mt-2 h2">Hire verified global manpower</h1>
          <p className="mt-3 text-navy/60">Post a requirement and get matched with skilled, screened and deployment-ready candidates — managed end to end by ForcePK.</p>
          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(([ic, t]) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-navy/75">
                <Icon name={ic} className="h-5 w-5 shrink-0 text-brand" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manpower we recruit — all 25 categories */}
      <section className="border-b border-navy/10 py-10">
        <div className="container-fp">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-navy/50">Manpower we recruit</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {CATEGORY_NAMES.map((name) => (
              <Link key={name} href={`/jobs?q=${encodeURIComponent(name)}`} className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm text-navy/70 transition hover:border-brand hover:text-brand">
                <Icon name="briefcase" className="h-4 w-4 text-brand" /> {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POST REQUIREMENT — gated behind a verified company profile */}
      <section id="post" className="section bg-navy-50">
        <div className="container-fp max-w-2xl">
          <div className="text-center">
            <span className="eyebrow">Create Requirement</span>
            <h2 className="mt-2 h2">Post your manpower requirement</h2>
            <p className="mt-3 text-navy/60">Requirements are posted from your verified company profile so our team can source and deploy against them.</p>
          </div>

          {isEmployer ? (
            <div className="card mt-10 flex flex-col items-center gap-3 p-10 text-center">
              <Icon name="check-circle" className="h-12 w-12 text-brand" />
              <p className="text-lg font-semibold text-navy">You&apos;re signed in as an employer</p>
              <p className="max-w-md text-sm text-navy/60">Head to your dashboard to post a new requirement and track sourcing in real time.</p>
              <Link href="/employer/requirements/new" className="btn-primary mt-2">Post a requirement <Icon name="arrow" className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="card mt-10 flex flex-col items-center gap-3 p-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="building" className="h-6 w-6" /></span>
              <p className="text-lg font-semibold text-navy">Create your company profile to post</p>
              <p className="max-w-md text-sm text-navy/60">To keep every requirement verified, posting starts with a free employer account. It takes a minute — then you can post unlimited requirements and manage candidates.</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register/employer" className="btn-primary">Create employer account <Icon name="arrow" className="h-4 w-4" /></Link>
                <Link href="/login" className="btn-outline">Sign in</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
