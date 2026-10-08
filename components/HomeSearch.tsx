"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { jobs, categories } from "@/lib/data";
import SearchSuggest, { type Suggestion } from "@/components/SearchSuggest";

export default function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const pool = useMemo<Suggestion[]>(() => {
    const profs = new Set<string>();
    jobs.forEach((j) => profs.add(j.title));
    const cats = new Set(categories.map((c) => c.name));
    const cities = new Set(jobs.map((j) => j.city));
    return [
      ...[...profs].map((label) => ({ label, kind: "Profession" as const })),
      ...[...cats].map((label) => ({ label, kind: "Category" as const })),
      ...[...cities].map((label) => ({ label, kind: "Location" as const })),
    ];
  }, []);

  const go = (term?: string) => {
    const q = (term ?? value).trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
  };

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <SearchSuggest
        value={value}
        onChange={setValue}
        onPick={(t) => go(t)}
        pool={pool}
        size="lg"
        placeholder="Search jobs, professions or locations — e.g. Electrician, Welder, Dubai"
      />
      <button
        onClick={() => go()}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark"
      >
        Search <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
