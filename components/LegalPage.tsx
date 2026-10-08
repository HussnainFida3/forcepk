export default function LegalPage({ title, intro, sections }: { title: string; intro?: string; sections: [string, string][] }) {
  return (
    <section className="section">
      <div className="container-fp max-w-3xl">
        <h1 className="text-3xl font-extrabold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/50">Last updated: {new Date().toLocaleDateString()}</p>
        {intro && <p className="mt-5 text-navy/70">{intro}</p>}
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
