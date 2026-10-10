import Icon from "@/components/Icon";

// Admin-side agreement manager: upload/display the signed agreement (text + a
// scanned image or PDF) between ForcePK and a partner/employer.
export default function AgreementCard({
  action, text, fileUrl, party,
}: {
  action: (formData: FormData) => void;
  text: string | null;
  fileUrl: string | null;
  party: string;
}) {
  const isPdf = !!fileUrl && /\.pdf($|\?)/i.test(fileUrl);
  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="doc" className="h-5 w-5 text-brand" /> Agreement ({party})</h2>
      <p className="mt-1 text-sm text-navy/55">Signed agreement between ForcePK and this {party.toLowerCase()}.</p>

      {fileUrl && (
        <div className="mt-4">
          {isPdf ? (
            <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm font-semibold text-navy hover:border-brand hover:text-brand">
              <Icon name="doc" className="h-4 w-4" /> View agreement PDF
            </a>
          ) : (
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <img src={fileUrl} alt="Signed agreement" className="max-h-72 w-full rounded-xl border border-navy/10 object-contain" />
            </a>
          )}
        </div>
      )}

      <form action={action} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-medium text-navy/55">Agreement text / terms</span>
          <textarea name="agreementText" defaultValue={text ?? ""} rows={4} placeholder="Paste the agreement terms, or a summary…" className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-navy/55">Upload signed agreement (image or PDF)</span>
          <input type="file" name="agreementFile" accept="image/*,application/pdf" className="mt-1 w-full text-sm text-navy/70 file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy/90" />
        </label>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save agreement</button>
      </form>
    </div>
  );
}
