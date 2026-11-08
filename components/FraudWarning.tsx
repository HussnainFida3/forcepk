import { ShieldAlert } from "lucide-react";

export default function FraudWarning() {
  return (
    <section className="section">
      <div className="container-fp">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Recruitment Fraud Warning</h3>
              <ul className="mt-3 space-y-2 text-sm text-amber-800">
                <li><strong>ForcePK never asks candidates for upfront payment</strong> for job placement, visa processing or interviews.</li>
                <li>Always verify job offers through official ForcePK channels before sharing personal documents.</li>
                <li>Legitimate overseas employment in Pakistan requires approval from the Bureau of Emigration &amp; Overseas Employment (BE&amp;OE). Ask for the OEP licence number and permission number for any vacancy.</li>
                <li>If someone claims to represent ForcePK and asks for money, <strong>do not pay</strong> — report them immediately.</li>
              </ul>
              <p className="mt-4 text-sm font-semibold text-amber-900">
                Report suspicious activity: <a href="mailto:hello@forcepk.com" className="underline">hello@forcepk.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
