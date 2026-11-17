/**
 * Universal CRUD + Email/WhatsApp/SMS engine for ForcePK AI agents.
 * Gives agents full Create / Read / Update / Delete on every Prisma model
 * EXCEPT password fields, plus email/WhatsApp/SMS sending.
 *
 * POST /api/ai-agents/<agent>/crud
 * { table, op, where?, data?, orderBy?, limit?, offset? }
 *
 * POST /api/ai-agents/<agent>/email
 * { to, subject, html }
 *
 * POST /api/ai-agents/<agent>/whatsapp
 * { to, text }
 *
 * POST /api/ai-agents/<agent>/sms
 * { to, text }
 */
import { prisma } from "@/lib/prisma";
import { sendEmail, sendWhatsApp, sendSMS } from "@/lib/integrations/channels";

const BLOCKED_FIELDS = new Set(["passwordHash", "password_hash", "password", "hashedPassword"]);

// Every Prisma model name (camelCase, matching prisma client delegates).
// Tables agents must NEVER access — auth tokens and sessions are security-sensitive.
const BLOCKED_TABLES = new Set(["userSession", "passwordResetToken", "emailVerificationToken"]);

const MODEL_MAP: Record<string, string> = {
  user: "user",
  company: "company",
  oep: "oep",
  candidateProfile: "candidateProfile",
  requirement: "requirement",
  application: "application",
  interview: "interview",
  document: "document",
  invoice: "invoice",
  commission: "commission",
  notification: "notification",
  auditLog: "auditLog",
  message: "message",
  lead: "lead",
  replacementCase: "replacementCase",
  agentTask: "agentTask",
  agentActionLog: "agentActionLog",
  hiringCompany: "hiringCompany",
  discoveredJob: "discoveredJob",
  whatsAppMessage: "whatsAppMessage",
  cvDrop: "cvDrop",
};

export function listTables(): string[] {
  return Object.keys(MODEL_MAP).filter((t) => !BLOCKED_TABLES.has(t)).sort();
}

function getDelegate(name: string) {
  if (BLOCKED_TABLES.has(name)) throw new Error(`Access to "${name}" is not permitted.`);
  const model = MODEL_MAP[name];
  if (!model) throw new Error(`Unknown table "${name}". Available: ${listTables().join(", ")}`);
  const delegate = (prisma as any)[model];
  if (!delegate) throw new Error(`Prisma delegate not found for "${model}".`);
  return delegate;
}

function stripBlocked(row: Record<string, unknown>): Record<string, unknown> {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  for (const f of BLOCKED_FIELDS) delete out[f];
  return out;
}

function stripBlockedFromData(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  for (const f of BLOCKED_FIELDS) delete out[f];
  return out;
}

function buildOrderBy(orderBy?: string | string[]) {
  if (!orderBy) return undefined;
  const items = Array.isArray(orderBy) ? orderBy : [orderBy];
  const result: Record<string, string>[] = [];
  for (const item of items) {
    const descending = item.startsWith("-");
    const col = descending ? item.slice(1) : item;
    result.push({ [col]: descending ? "desc" : "asc" });
  }
  return result.length === 1 ? result[0] : result;
}

export interface CrudRequest {
  table: string;
  op: "list" | "get" | "create" | "update" | "delete" | "count" | "tables";
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
  orderBy?: string | string[];
  limit?: number;
  offset?: number;
  include?: Record<string, boolean>;
}

export async function agentCrud(body: CrudRequest) {
  if (body.op === "tables") {
    return { tables: listTables() };
  }

  const delegate = getDelegate(body.table);

  switch (body.op) {
    case "count": {
      const c = await delegate.count({ where: body.where });
      return { count: c };
    }

    case "list": {
      const lim = Math.min(body.limit ?? 50, 200);
      const off = body.offset ?? 0;
      const rows = await delegate.findMany({
        where: body.where,
        orderBy: buildOrderBy(body.orderBy),
        take: lim,
        skip: off,
        ...(body.include ? { include: body.include } : {}),
      });
      return { rows: rows.map(stripBlocked), limit: lim, offset: off };
    }

    case "get": {
      if (!body.where) throw new Error("`where` is required for get.");
      const row = await delegate.findFirst({
        where: body.where,
        ...(body.include ? { include: body.include } : {}),
      });
      return { row: row ? stripBlocked(row) : null };
    }

    case "create": {
      if (!body.data) throw new Error("`data` is required for create.");
      if (Array.isArray(body.data)) {
        const cleaned = body.data.map(stripBlockedFromData);
        const count = await delegate.createMany({ data: cleaned });
        return { created: count };
      }
      const cleaned = stripBlockedFromData(body.data);
      const row = await delegate.create({ data: cleaned });
      return { created: [stripBlocked(row)] };
    }

    case "update": {
      if (!body.where) throw new Error("`where` is required for update.");
      if (!body.data || Array.isArray(body.data)) throw new Error("`data` must be an object for update.");
      const cleaned = stripBlockedFromData(body.data);
      // Use updateMany for compound where, findFirst+update for single
      if (body.where.id) {
        const row = await delegate.update({ where: { id: body.where.id }, data: cleaned });
        return { updated: [stripBlocked(row)] };
      }
      const result = await delegate.updateMany({ where: body.where, data: cleaned });
      return { updated: result.count };
    }

    case "delete": {
      if (!body.where) throw new Error("`where` is required for delete.");
      if (body.where.id) {
        const row = await delegate.delete({ where: { id: body.where.id } });
        return { deleted: [stripBlocked(row)] };
      }
      const result = await delegate.deleteMany({ where: body.where });
      return { deleted: result.count };
    }

    default:
      throw new Error(`Unknown op "${body.op}". Use: tables, list, get, create, update, delete, count.`);
  }
}

// ── Email / WhatsApp / SMS sending ──

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

export async function agentSendEmail(body: EmailRequest) {
  if (!body.to || !body.subject) throw new Error("`to` and `subject` are required.");
  const result = await sendEmail(body.to, body.subject, body.html || "");
  return result;
}

export interface WhatsAppRequest {
  to: string;
  text: string;
}

export async function agentSendWhatsApp(body: WhatsAppRequest) {
  if (!body.to || !body.text) throw new Error("`to` and `text` are required.");
  return await sendWhatsApp(body.to, body.text);
}

export interface SmsRequest {
  to: string;
  text: string;
}

export async function agentSendSMS(body: SmsRequest) {
  if (!body.to || !body.text) throw new Error("`to` and `text` are required.");
  return await sendSMS(body.to, body.text);
}
