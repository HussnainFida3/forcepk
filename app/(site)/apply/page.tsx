import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap, Globe } from "lucide-react";
import CvDropForm from "@/components/CvDropForm";

export const metadata = { title: "Upload Your CV" };

const ERRORS: Record<string, string> = {
  missing: "Please add your name and attach a CV file.",
  type: "That file type isn't supported — upload a PDF, DOC or DOCX.",
  size: "That file is over 10 MB — please upload a smaller file.",
  upload: "Something went wrong saving your file. Please try again.",
};

export default function ApplyPage({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  const sent = !!searchParams?.sent;
  const error = searchParams?.error ? ERRORS[searchParams.error] ?? "Please try again." : null;

  return (
    <section className="relative overflow-hidden bg-navy-50 py-14 lg:py-20">
      <div className="container-fp max-w-xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand-dark">For Candidates</span>
          <h1 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Upload your CV</h1>
          <p className="mt-2 text-navy/60">Drop your CV and you&apos;re in our talent pool — no account needed. Employers hiring your skills can find you.</p>
        </div>

        {sent ? (
          <div className="card mt-8 flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand"><CheckCircle2 className="h-8 w-8" /></span>
            <h2 className="text-xl font-bold text-navy">CV received — you&apos;re in!</h2>
            <p className="max-w-sm text-sm text-navy/60">Thanks for applying to ForcePK. Our team will reach out if your profile matches an open requirement.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link href="/apply" className="btn-primary">Upload another CV</Link>
              <Link href="/jobs" className="btn-outline">Browse jobs</Link>
            </div>
          </div>
        ) : (
          <div className="card mt-8 p-6 sm:p-8">
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
            <CvDropForm />
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-navy/60">
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-brand" /> Takes 30 seconds</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> Kept confidential</span>
          <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-brand" /> Gulf & worldwide roles</span>
        </div>
      </div>
    </section>
  );
}
