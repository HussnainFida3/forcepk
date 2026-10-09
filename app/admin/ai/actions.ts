"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/session";
import { ADMIN_ROLES } from "@/lib/rbac";
import { runAgent, type AgentResult } from "@/lib/integrations/agent";

export type AgentState = (AgentResult & { command: string; persona: string }) | undefined;

export async function runAgentAction(_prev: AgentState, formData: FormData): Promise<AgentState> {
  const user = await currentUser();
  if (!user || !ADMIN_ROLES.includes(user.role as never)) {
    return { ok: false, ai: false, answer: "Not authorized.", steps: [], command: "", persona: "ops" };
  }
  const persona = String(formData.get("persona") ?? "ops");
  const command = String(formData.get("command") ?? "").trim();
  if (!command) return { ok: false, ai: false, answer: "Type a command for the agent.", steps: [], command: "", persona };

  const result = await runAgent(persona, command, { userId: user.id });
  // Agents can change data (leads, companies, etc.) — refresh the affected views.
  revalidatePath("/admin");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/companies");
  return { ...result, command, persona };
}
