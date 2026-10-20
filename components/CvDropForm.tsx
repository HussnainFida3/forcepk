"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud, FileText, X, ArrowRight } from "lucide-react";
import ProfessionSelect from "@/components/ProfessionSelect";
import { submitCvDrop } from "@/lib/mutations";

export default function CvDropForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const setFiles = (files: FileList | null) => {
    if (files && files[0] && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(files[0]);
      inputRef.current.files = dt.files;
      setFileName(files[0].name);
    }
  };

  return (
    <form action={submitCvDrop} className="space-y-4">
      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); setFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${drag ? "border-brand bg-brand/5" : "border-navy/20 hover:border-brand hover:bg-brand/5"}`}
      >
        {fileName ? (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand"><FileText className="h-6 w-6" /></span>
            <p className="flex items-center gap-2 font-semibold text-navy">{fileName}
              <button type="button" onClick={(e) => { e.stopPropagation(); setFileName(null); if (inputRef.current) inputRef.current.value = ""; }} className="text-navy/40 hover:text-red-500"><X className="h-4 w-4" /></button>
            </p>
            <p className="text-xs text-navy/50">Click to choose a different file</p>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy/50"><UploadCloud className="h-6 w-6" /></span>
            <p className="font-semibold text-navy">Drop your CV here, or click to browse</p>
            <p className="text-xs text-navy/50">PDF, DOC or DOCX · up to 10 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" name="cv" accept=".pdf,.doc,.docx" required onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} className="hidden" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-navy/70">Full name *</span>
          <input name="name" required placeholder="Your name" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-navy/70">Mobile / WhatsApp</span>
          <input name="phone" placeholder="+92 300 1234567" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-navy/70">Email</span>
          <input name="email" type="email" placeholder="you@example.com" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-navy/70">Profession / trade</span>
          <ProfessionSelect required={false} />
        </label>
      </div>

      <SubmitButton />
      <p className="text-center text-xs text-navy/45">By submitting you agree ForcePK may contact you about relevant opportunities.</p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Uploading…" : <>Submit CV <ArrowRight className="h-4 w-4" /></>}
    </button>
  );
}
