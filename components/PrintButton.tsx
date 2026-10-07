"use client";

import Icon from "./Icon";

export default function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-primary no-print">
      <Icon name="doc" className="h-4 w-4" /> {label}
    </button>
  );
}
