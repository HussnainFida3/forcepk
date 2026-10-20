"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud, FileText, X, ArrowRight } from "lucide-react";
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

      <SubmitButton />
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
