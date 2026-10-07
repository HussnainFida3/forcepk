import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCandidate } from "@/lib/mutations";

export const metadata = { title: "Edit candidate" };
export const dynamic = "force-dynamic";

export default async function EditCandidate({ params }: { params: { id: string } }) {
  const c = await prisma.candidateProfile.findUnique({
    where: { id: params.id },
    select: { id: true, profession: true, city: true, experienceYrs: true, saudiExpYrs: true, education: true, salaryExpect: true, summary: true, skills: true, languages: true, certifications: true, user: { select: { name: true } } },
  });
  if (!c) notFound();

  const field = (label: string, name: string, value: string | number | null, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-navy/55">{label}</span>
      <input name={name} defaultValue={value ?? ""} type={type} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/candidates/${c.id}`} className="mb-2 inline-flex items-center gap-1 text-sm text-navy/50 transition hover:text-brand">← Back to profile</Link>
        <h1 className="text-2xl font-bold text-navy">Edit {c.user.name}</h1>
      </div>
      <form action={updateCandidate.bind(null, c.id)} className="card max-w-3xl space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {field("Profession", "profession", c.profession)}
          {field("City", "city", c.city)}
          {field("Experience (years)", "experienceYrs", c.experienceYrs, "number")}
          {field("Overseas experience (years)", "saudiExpYrs", c.saudiExpYrs, "number")}
          {field("Education", "education", c.education)}
          {field("Salary expectation", "salaryExpect", c.salaryExpect)}
        </div>
        {field("Skills (comma-separated)", "skills", c.skills.join(", "))}
        {field("Languages (comma-separated)", "languages", c.languages.join(", "))}
        {field("Certifications (comma-separated)", "certifications", c.certifications.join(", "))}
        <label className="block">
          <span className="text-xs font-medium text-navy/55">Summary</span>
          <textarea name="summary" defaultValue={c.summary ?? ""} rows={4} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
        </label>
        <div className="flex justify-end gap-3">
          <Link href={`/admin/candidates/${c.id}`} className="rounded-lg border border-navy/15 px-5 py-2 text-sm font-semibold text-navy/70 hover:bg-navy/5">Cancel</Link>
          <button className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save changes</button>
        </div>
      </form>
    </div>
  );
}
