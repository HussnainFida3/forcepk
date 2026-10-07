export const metadata = { title: "Terms of Service" };

const sections: [string, string][] = [
  ["Acceptance of terms", "By using forcepk.com you agree to these Terms of Service. If you use the platform on behalf of a company, you confirm you are authorised to bind that company."],
  ["The service", "ForcePK is a B2B workforce recruitment platform that connects employers with recruitment partners and candidates. We facilitate sourcing, screening, interview coordination, documentation and deployment support. ForcePK complements, and does not replace, official government and licensing systems."],
  ["Accounts & verification", "Employers, partners and candidates must provide accurate information. We may verify, approve, reject or suspend accounts. You are responsible for safeguarding your login credentials."],
  ["Acceptable use", "You agree not to misuse the platform, upload unlawful content, misrepresent identity or qualifications, scrape data, or attempt to access data you are not authorised to view. Sensitive candidate documents must only be used for legitimate recruitment purposes."],
  ["Fees & commissions", "Recruitment fees, service fees and partner commissions are governed by the commercial terms agreed between the parties. Invoices and payouts are tracked within the platform."],
  ["Replacement terms", "Replacement or guarantee terms are agreed individually in each employer contract before recruitment begins, including the period, conditions and number of replacements. ForcePK does not offer a blanket guarantee."],
  ["Compliance", "Users are responsible for complying with applicable recruitment, immigration and labour laws in the relevant jurisdictions. ForcePK supports recruitment operations around official processes."],
  ["Intellectual property", "The platform, its design and content are owned by ForcePK. You retain ownership of content you submit and grant us a licence to process it to provide the service."],
  ["Disclaimers", "The platform is provided \"as is\". We do not guarantee placement outcomes. AI-assisted matching and screening are decision-support tools; final hiring, legal and eligibility decisions rest with the relevant parties."],
  ["Limitation of liability", "To the extent permitted by law, ForcePK is not liable for indirect or consequential losses arising from use of the platform."],
  ["Changes", "We may update these terms; continued use after changes constitutes acceptance."],
  ["Contact", "Questions about these terms: legal@forcepk.com."],
];

export default function Terms() {
  return (
    <section className="section">
      <div className="container-fp max-w-3xl">
        <h1 className="text-3xl font-extrabold text-navy">Terms of Service</h1>
        <p className="mt-2 text-sm text-navy/50">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-6">
          {sections.map(([h, b]) => (
            <div key={h}>
              <h2 className="text-lg font-bold text-navy">{h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy/70">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
