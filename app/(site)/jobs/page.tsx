import JobsClient from "@/components/JobsClient";

export const metadata = { title: "Find Jobs Worldwide" };

export default function JobsPage({ searchParams }: { searchParams: { q?: string } }) {
  return <JobsClient initialQuery={searchParams?.q ?? ""} />;
}
