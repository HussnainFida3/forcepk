export const metadata = { title: "Privacy Policy" };

const sections: [string, string][] = [
  ["Who we are", "ForcePK (\"we\", \"us\") operates forcepk.com, a B2B workforce recruitment platform connecting employers, recruitment partners and candidates worldwide."],
  ["Information we collect", "Account data (name, email, phone), candidate data (profession, experience, skills, salary expectations), identity and travel documents (passport, national ID) uploaded to your secure document wallet, employer and partner company details, and usage data. We collect only what is needed to provide recruitment services."],
  ["How we use your information", "To create and verify accounts, match candidates to requirements, coordinate interviews and documentation, process deployments, communicate updates, and comply with applicable recruitment and labour requirements."],
  ["Lawful basis", "We process personal data to perform our recruitment services (contract), with your consent where required, and to meet legal obligations. You may withdraw consent at any time by contacting us."],
  ["Document security", "Sensitive documents such as passports and national IDs are stored privately and are never exposed publicly. They are shared only with authorised employers, partners and staff involved in your placement, and are served through authenticated, access-controlled links."],
  ["Sharing", "We share candidate profiles and documents only with authorised employers and recruitment partners for the purpose of a specific opportunity. We do not sell personal data. Service providers (email, hosting, AI, payments) process data on our behalf under appropriate agreements."],
  ["Data retention", "We retain personal data for as long as your account is active and as required to provide services and meet legal obligations. You may request deletion of your account and associated data, subject to retention requirements."],
  ["Your rights", "Subject to applicable law, you may request access, correction, deletion, restriction or portability of your personal data, and object to certain processing. Contact privacy@forcepk.com to exercise these rights."],
  ["International transfers", "As a global platform, your data may be processed in countries other than your own. We apply appropriate safeguards for such transfers."],
  ["Cookies", "We use essential cookies for authentication and session management, and a preference cookie for language. See the cookie banner to manage non-essential preferences."],
  ["Contact", "For privacy questions or requests, contact privacy@forcepk.com."],
];

export default function Privacy() {
  return (
    <section className="section">
      <div className="container-fp max-w-3xl">
        <h1 className="text-3xl font-extrabold text-navy">Privacy Policy</h1>
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
