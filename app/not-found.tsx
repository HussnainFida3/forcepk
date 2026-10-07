import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-50 p-6">
      <div className="text-center">
        <div className="text-7xl font-extrabold text-brand">404</div>
        <h1 className="mt-2 text-xl font-bold text-navy">Page not found</h1>
        <p className="mt-2 text-sm text-navy/60">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  );
}
