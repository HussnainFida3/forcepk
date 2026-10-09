"use client";

import { useRef } from "react";
import Icon from "@/components/Icon";
import { sendMessage } from "@/lib/mutations";

export default function MessageComposer({ recipientId }: { recipientId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await sendMessage(fd);
        formRef.current?.reset();
      }}
      className="flex items-center gap-2 border-t border-navy/10 p-3"
    >
      <input type="hidden" name="recipientId" value={recipientId} />
      <input
        name="body"
        required
        autoComplete="off"
        placeholder="Type a message…"
        className="flex-1 rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand"
      />
      <button type="submit" className="btn-primary" aria-label="Send">
        <Icon name="arrow" className="h-4 w-4" />
      </button>
    </form>
  );
}
