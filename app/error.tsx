"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-navy-50 p-6">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-2xl">⚠️</div>
        <h1 className="mt-4 text-xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 text-sm text-navy/60">
          We hit an unexpected error. This can happen if the database is temporarily unreachable. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <a href="/" className="btn-outline">Go home</a>
        </div>
      </div>
    </div>
  );
}
