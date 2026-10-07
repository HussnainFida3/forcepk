import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadDocument } from "@/lib/mutations";
import { docTone } from "@/lib/candidate";

export const metadata = { title: "My Documents" };
export const dynamic = "force-dynamic";

const TYPES: { type: string; label: string }[] = [
  { type: "CV", label: "CV / Resume" },
  { type: "PASSPORT", label: "Passport" },
  { type: "CNIC", label: "National ID" },
  { type: "PHOTO", label: "Photograph" },
  { type: "EXPERIENCE_CERT", label: "Experience Certificate" },
  { type: "EDUCATION_CERT", label: "Educational Documents" },
  { type: "MEDICAL", label: "Medical Report" },
  { type: "CERTIFICATION", label: "Certifications" },
];

export default async function CandidateDocuments() {
  const u = await currentUser();
  const docs = u?.candidate?.id ? await prisma.document.findMany({ where: { candidateId: u.candidate.id } }) : [];
  const byType = new Map(docs.map((d) => [d.type, d]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Documents</h1>
        <p className="text-sm text-navy/60">Securely upload your documents. Files are private — only authorized staff and employers can view them.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TYPES.map(({ type, label }) => {
          const d = byType.get(type as never);
          const status = d?.status ?? "MISSING";
          return (
            <div key={type} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-navy"><Icon name="doc" className="h-5 w-5 text-brand" /> {label}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${docTone[status.charAt(0) + status.slice(1).toLowerCase()] ?? "bg-red-100 text-red-700"}`}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
              </div>
              {d?.fileUrl && (
                <a href={`/api/files/${d.fileUrl}`} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                  <Icon name="doc" className="h-3.5 w-3.5" /> View uploaded file
                </a>
              )}
              <form action={uploadDocument} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="type" value={type} />
                <input type="file" name="file" required className="block w-full text-xs text-navy/60 file:mr-2 file:rounded-md file:border-0 file:bg-brand/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-dark" />
                <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Upload</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
