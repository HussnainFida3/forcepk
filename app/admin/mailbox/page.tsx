"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

/**
 * ForcePK admin mailbox — the info@forcepk.com inbox, inside the Command Center.
 *
 * Send/receive runs through the shared mail service (one place holds the Resend
 * keys, IMAP and inbound store for every brand). The browser talks only to a
 * same-origin proxy (/api/admin/mailbox) authenticated by the admin's NextAuth
 * session; the proxy forwards to the service, which only ever returns ForcePK's
 * mail.
 */

const ENDPOINT = "/api/admin/mailbox";
const ACCENT = "#008e8c";
const ADDRESS = "info@forcepk.com";

interface Addr { name: string; address: string }
interface Envelope {
  uid: number; messageId: string; subject: string;
  from: Addr[]; to: Addr[]; date: string;
  seen: boolean; flagged: boolean; hasAttachments: boolean; snippet: string;
}
interface Message extends Envelope {
  cc: Addr[]; html: string; text: string;
  attachments: { filename: string; contentType: string; size: number }[];
  inReplyTo?: string; references?: string[];
}
interface Folder { name: string; path: string; total: number; unseen: number; specialUse?: string }
type Banner = { kind: "error" | "ok"; text: string } | null;

const PAGE_SIZE = 30;

function fmtAddr(a: Addr[]): string { return a?.length ? a.map((x) => x.name || x.address).join(", ") : "(unknown)"; }
function initials(a: Addr[]): string { return (a?.[0]?.name || a?.[0]?.address || "?").trim().slice(0, 1).toUpperCase(); }
function fmtDate(iso: string): string {
  const d = new Date(iso); if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], d.getFullYear() === now.getFullYear() ? { month: "short", day: "numeric" } : { year: "numeric", month: "short", day: "numeric" });
}
function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  let j: unknown = null;
  try { j = await res.json(); } catch { throw new Error(`Server returned ${res.status}.`); }
  const body = j as { error?: string } & T;
  if (!res.ok || (body && typeof body === "object" && "error" in body && body.error)) {
    throw new Error(body?.error || `Request failed (${res.status}).`);
  }
  return body as T;
}

export default function MailboxPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folder, setFolder] = useState("INBOX");
  const [messages, setMessages] = useState<Envelope[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Message | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [readLoading, setReadLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState<Banner>(null);
  const [compose, setCompose] = useState<null | { to: string; cc: string; subject: string; body: string; inReplyTo?: string; references?: string[] }>(null);

  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((b: Banner) => {
    setBanner(b);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    if (b) bannerTimer.current = setTimeout(() => setBanner(null), 5000);
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const r = await call<{ data: Folder[] }>(`${ENDPOINT}?action=folders`);
      setFolders(r.data);
    } catch (e) { flash({ kind: "error", text: e instanceof Error ? e.message : "Could not load folders." }); }
  }, [flash]);

  const loadMessages = useCallback(async (fold: string, pg: number) => {
    setListLoading(true); setListError(null);
    try {
      const r = await call<{ data: { messages: Envelope[]; total: number } }>(`${ENDPOINT}?action=list&folder=${encodeURIComponent(fold)}&page=${pg}&pageSize=${PAGE_SIZE}`);
      setMessages(r.data.messages); setTotal(r.data.total);
    } catch (e) { setMessages([]); setTotal(0); setListError(e instanceof Error ? e.message : "Could not load messages."); }
    finally { setListLoading(false); }
  }, []);

  const openMessage = useCallback(async (env: Envelope) => {
    setReadLoading(true);
    setSelected({ ...env, cc: [], html: "", text: "", attachments: [] } as Message);
    try {
      const r = await call<{ data: Message }>(`${ENDPOINT}?action=read&folder=${encodeURIComponent(folder)}&uid=${env.uid}`);
      setSelected(r.data);
      setMessages((ms) => ms.map((m) => (m.uid === env.uid ? { ...m, seen: true } : m)));
    } catch (e) { flash({ kind: "error", text: e instanceof Error ? e.message : "Could not open message." }); }
    finally { setReadLoading(false); }
  }, [folder, flash]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { loadMessages(folder, page); }, [folder, page, loadMessages]);

  async function doMark(env: Envelope, flag: "seen" | "unseen" | "flagged" | "unflagged") {
    setMessages((ms) => ms.map((m) => (m.uid === env.uid ? { ...m, seen: flag === "seen" ? true : flag === "unseen" ? false : m.seen, flagged: flag === "flagged" ? true : flag === "unflagged" ? false : m.flagged } : m)));
    try { await call(`${ENDPOINT}`, { method: "POST", body: JSON.stringify({ action: "mark", folder, uid: env.uid, flag }) }); }
    catch (e) { flash({ kind: "error", text: e instanceof Error ? e.message : "Could not update." }); loadMessages(folder, page); }
  }
  async function doDelete(env: Envelope) {
    if (!confirm(`Delete "${env.subject || "(no subject)"}"?`)) return;
    const prev = messages;
    setMessages((ms) => ms.filter((m) => m.uid !== env.uid));
    if (selected?.uid === env.uid) setSelected(null);
    try { await call(`${ENDPOINT}`, { method: "POST", body: JSON.stringify({ action: "delete", folder, uid: env.uid }) }); flash({ kind: "ok", text: "Deleted." }); }
    catch (e) { setMessages(prev); flash({ kind: "error", text: e instanceof Error ? e.message : "Could not delete." }); }
  }
  function startReply(m: Message) {
    const refs = [...(m.references ?? []), m.messageId].filter(Boolean);
    const quoted = (m.text || "").split("\n").map((l) => `> ${l}`).join("\n");
    setCompose({ to: m.from?.[0]?.address ?? "", cc: "", subject: m.subject?.startsWith("Re:") ? m.subject : `Re: ${m.subject}`, body: `\n\n---\nOn ${fmtDate(m.date)}, ${fmtAddr(m.from)} wrote:\n${quoted}`, inReplyTo: m.messageId, references: refs });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => m.subject.toLowerCase().includes(q) || fmtAddr(m.from).toLowerCase().includes(q) || m.snippet.toLowerCase().includes(q));
  }, [messages, search]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isSent = folder.toLowerCase().includes("sent");

  return (
    <div className="fpmail">
      <style>{css}</style>
      <div className="gm-bar">
        <div>
          <h1 className="gm-title">Mailbox</h1>
          <div className="gm-addr">{ADDRESS}</div>
        </div>
        {banner && <div className={`gm-banner ${banner.kind}`}>{banner.text}</div>}
        <button className="gm-compose" onClick={() => setCompose({ to: "", cc: "", subject: "", body: "" })}>✎ Compose</button>
      </div>

      <div className="gm-grid">
        <aside className="gm-rail">
          {folders.length === 0 ? <div className="gm-rail-empty">No folders</div> : folders.map((f) => (
            <button key={f.path} className={`gm-folder ${f.path === folder ? "on" : ""}`} onClick={() => { setFolder(f.path); setPage(1); setSelected(null); }}>
              <span className="gm-folder-name">{f.name}</span>
              {f.unseen > 0 && <span className="gm-folder-badge">{f.unseen}</span>}
            </button>
          ))}
        </aside>

        <section className="gm-list">
          <div className="gm-list-head">
            <input className="gm-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
            <button className="gm-refresh" onClick={() => loadMessages(folder, page)} disabled={listLoading}>↻</button>
          </div>
          <div className="gm-list-body">
            {listLoading && messages.length === 0 ? (
              <div className="gm-skel">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="gm-skel-row" />)}</div>
            ) : listError ? (
              <div className="gm-state err"><p>{listError}</p><button onClick={() => loadMessages(folder, page)}>Try again</button></div>
            ) : filtered.length === 0 ? (
              <div className="gm-state"><p>{search ? "No matches." : "This folder is empty."}</p></div>
            ) : filtered.map((m) => (
              <button key={m.uid} className={`gm-msg ${selected?.uid === m.uid ? "on" : ""} ${m.seen ? "" : "unseen"}`} onClick={() => openMessage(m)}>
                <span className="gm-ava">{initials(isSent ? m.to : m.from)}</span>
                <span className="gm-msg-main">
                  <span className="gm-msg-top"><span className="gm-msg-from">{fmtAddr(isSent ? m.to : m.from)}</span><span className="gm-msg-date">{fmtDate(m.date)}</span></span>
                  <span className="gm-msg-sub">{!m.seen && <span className="gm-dot" />}{m.subject || "(no subject)"}{m.hasAttachments && " 📎"}</span>
                  {m.snippet && <span className="gm-msg-snip">{m.snippet}</span>}
                </span>
                <span className={`gm-star ${m.flagged ? "on" : ""}`} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); doMark(m, m.flagged ? "unflagged" : "flagged"); }}>★</span>
              </button>
            ))}
          </div>
          <div className="gm-pager">
            <span>{total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`} of {total}</span>
            <span className="gm-pager-btns">
              <button disabled={page <= 1 || listLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
              <button disabled={page >= totalPages || listLoading} onClick={() => setPage((p) => p + 1)}>›</button>
            </span>
          </div>
        </section>

        <section className="gm-reader">
          {!selected ? (
            <div className="gm-state tall"><p>Select a message to read</p></div>
          ) : (
            <>
              <div className="gm-reader-head">
                <h2>{selected.subject || "(no subject)"}</h2>
                <div className="gm-reader-actions">
                  <button title="Reply" onClick={() => startReply(selected)}>↩</button>
                  <button title={selected.flagged ? "Unflag" : "Flag"} onClick={() => doMark(selected, selected.flagged ? "unflagged" : "flagged")}>★</button>
                  <button title="Delete" onClick={() => doDelete(selected)}>🗑</button>
                </div>
              </div>
              <div className="gm-reader-meta">
                <span className="gm-ava lg">{initials(selected.from)}</span>
                <div className="gm-reader-addr"><div className="gm-reader-from">{fmtAddr(selected.from)}</div><div className="gm-reader-to">to {fmtAddr(selected.to)}</div></div>
                <div className="gm-reader-date">{new Date(selected.date).toLocaleString()}</div>
              </div>
              <div className="gm-reader-body">
                {readLoading ? <div className="gm-state"><p>Loading…</p></div>
                  : selected.html ? <iframe title="message" className="gm-iframe" sandbox="" srcDoc={`<!doctype html><meta charset=utf-8><base target=_blank><style>body{font-family:system-ui,sans-serif;color:#101f37;margin:16px;line-height:1.55;font-size:14px}img{max-width:100%}</style>${selected.html}`} />
                  : <pre className="gm-text">{selected.text || "(empty)"}</pre>}
              </div>
            </>
          )}
        </section>
      </div>

      {compose && (
        <Compose initial={compose} onClose={() => setCompose(null)}
          onSent={() => { setCompose(null); flash({ kind: "ok", text: "Email sent." }); if (isSent) loadMessages(folder, page); }}
          send={async (p) => { await call(`${ENDPOINT}`, { method: "POST", body: JSON.stringify({ action: "send", ...p }) }); }} />
      )}
    </div>
  );
}

function Compose({ initial, onClose, onSent, send }: {
  initial: { to: string; cc: string; subject: string; body: string; inReplyTo?: string; references?: string[] };
  onClose: () => void; onSent: () => void;
  send: (p: { to: string; cc?: string; subject: string; html: string; text: string; inReplyTo?: string; references?: string[] }) => Promise<void>;
}) {
  const [to, setTo] = useState(initial.to);
  const [cc, setCc] = useState(initial.cc);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(null);
    if (!to.trim()) return setError("Add a recipient.");
    if (!subject.trim()) return setError("Add a subject.");
    setSending(true);
    try {
      const html = body.split("\n").map((l) => (l.trim() ? escapeHtml(l) : "<br/>")).join("<br/>");
      await send({ to: to.trim(), cc: cc.trim() || undefined, subject: subject.trim(), html, text: body, inReplyTo: initial.inReplyTo, references: initial.references });
      onSent();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not send."); }
    finally { setSending(false); }
  }
  return (
    <div className="gm-overlay" onClick={onClose}>
      <form className="gm-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="gm-modal-head"><span>New message · <strong>ForcePK</strong></span><button type="button" onClick={onClose}>✕</button></div>
        <label className="gm-f"><span>To</span><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" autoFocus /></label>
        <label className="gm-f"><span>Cc</span><input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="optional" /></label>
        <label className="gm-f"><span>Subject</span><input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <textarea className="gm-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" />
        {error && <div className="gm-modal-err">{error}</div>}
        <div className="gm-modal-foot"><button type="button" className="gm-ghost" onClick={onClose} disabled={sending}>Discard</button><button type="submit" className="gm-send" disabled={sending}>{sending ? "Sending…" : "Send"}</button></div>
      </form>
    </div>
  );
}

const css = `
.fpmail{--acc:${ACCENT};font-family:inherit}
.gm-bar{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
.gm-title{margin:0;font-size:18px;font-weight:800;color:#101f37;letter-spacing:-.01em}
.gm-addr{font-weight:600;color:#5b6b82;font-size:12.5px;margin-top:2px}
.gm-banner{font-size:12.5px;font-weight:600;padding:6px 12px;border-radius:8px;margin-top:2px}
.gm-banner.ok{color:#0a7d44;background:#eafaf2}.gm-banner.err{color:#c0362c;background:#fdecea}
.gm-compose{margin-left:auto;background:var(--acc);color:#fff;border:none;border-radius:10px;padding:10px 18px;font-weight:700;font-size:13px;cursor:pointer}
.gm-compose:hover{opacity:.92}
.gm-grid{display:grid;grid-template-columns:180px minmax(280px,1fr) 1.4fr;gap:1px;background:#dce6eb;border:1px solid #dce6eb;border-radius:16px;overflow:hidden;height:calc(100vh - 230px);min-height:440px}
.gm-rail,.gm-list,.gm-reader{background:#fff;overflow-y:auto}
.gm-rail{padding:10px 8px;display:flex;flex-direction:column;gap:2px}
.gm-folder{display:flex;align-items:center;gap:8px;padding:9px 12px;border:none;background:none;border-radius:9px;color:#51637b;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;text-align:left}
.gm-folder:hover{background:#f1f7fa}
.gm-folder.on{background:#e6f5f4;color:var(--acc)}
.gm-folder-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-transform:capitalize}
.gm-folder-badge{background:var(--acc);color:#fff;font-size:10px;font-weight:800;padding:1px 7px;border-radius:999px}
.gm-rail-empty{color:#9aa7b8;font-size:12px;padding:16px;text-align:center}
.gm-list{display:flex;flex-direction:column}
.gm-list-head{display:flex;gap:8px;padding:10px;border-bottom:1px solid #eef3f5;position:sticky;top:0;background:#fff;z-index:2}
.gm-search{flex:1;padding:8px 12px;border:1px solid #dce6eb;border-radius:9px;font-size:13px;font-family:inherit;outline:none}
.gm-search:focus{border-color:var(--acc)}
.gm-refresh{padding:8px 12px;border:1px solid #dce6eb;border-radius:9px;background:#fff;cursor:pointer;color:#51637b}
.gm-list-body{flex:1;overflow-y:auto}
.gm-msg{width:100%;display:flex;gap:10px;padding:12px 13px;border:none;border-bottom:1px solid #f1f5f7;background:none;cursor:pointer;text-align:left;font-family:inherit}
.gm-msg:hover{background:#f7fbfc}
.gm-msg.on{background:#e6f5f4;box-shadow:inset 3px 0 0 var(--acc)}
.gm-ava{width:34px;height:34px;border-radius:999px;background:#e6f5f4;color:var(--acc);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
.gm-ava.lg{width:42px;height:42px;font-size:15px}
.gm-msg-main{flex:1;min-width:0;display:flex;flex-direction:column}
.gm-msg-top{display:flex;justify-content:space-between;gap:8px}
.gm-msg-from{font-size:13px;font-weight:600;color:#26374d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-msg.unseen .gm-msg-from{font-weight:800;color:#101f37}
.gm-msg-date{font-size:11px;color:#9aa7b8;flex-shrink:0}
.gm-msg-sub{display:flex;align-items:center;gap:6px;font-size:12.5px;color:#51637b;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-msg.unseen .gm-msg-sub{color:#101f37;font-weight:600}
.gm-dot{width:7px;height:7px;border-radius:999px;background:var(--acc);flex-shrink:0}
.gm-msg-snip{font-size:11.5px;color:#9aa7b8;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-star{color:#cdd8e0;font-size:16px;flex-shrink:0}
.gm-star.on{color:#f5b942}
.gm-pager{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-top:1px solid #eef3f5;font-size:12px;color:#9aa7b8}
.gm-pager-btns button{border:1px solid #dce6eb;background:#fff;border-radius:7px;padding:3px 10px;margin-left:5px;cursor:pointer;font-size:15px;color:#51637b}
.gm-pager-btns button:disabled{opacity:.4}
.gm-reader{display:flex;flex-direction:column}
.gm-reader-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 12px;border-bottom:1px solid #eef3f5}
.gm-reader-head h2{margin:0;font-size:16px;font-weight:700;color:#101f37}
.gm-reader-actions button{border:1px solid #dce6eb;background:#fff;border-radius:8px;padding:7px 10px;margin-left:5px;cursor:pointer;font-size:14px}
.gm-reader-actions button:hover{background:#f1f7fa}
.gm-reader-meta{display:flex;align-items:center;gap:11px;padding:13px 18px}
.gm-reader-addr{flex:1;min-width:0}
.gm-reader-from{font-size:13px;font-weight:700;color:#26374d}
.gm-reader-to{font-size:11.5px;color:#9aa7b8}
.gm-reader-date{font-size:11px;color:#9aa7b8}
.gm-reader-body{flex:1;overflow-y:auto}
.gm-iframe{width:100%;height:100%;min-height:320px;border:none;background:#fff}
.gm-text{margin:0;padding:18px;white-space:pre-wrap;word-break:break-word;font-family:inherit;font-size:13.5px;color:#26374d;line-height:1.6}
.gm-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:40px 20px;color:#9aa7b8;font-size:13px;text-align:center}
.gm-state.tall{height:100%}.gm-state.err{color:#c0362c}
.gm-state button{padding:7px 16px;border:1px solid #dce6eb;border-radius:9px;background:#fff;cursor:pointer;font-size:12px;font-family:inherit}
.gm-skel{display:flex;flex-direction:column;gap:8px;padding:10px}
.gm-skel-row{height:60px;border-radius:10px;background:linear-gradient(90deg,#f1f7fa,#e6eef2,#f1f7fa);background-size:200% 100%;animation:gmsh 1.3s infinite}
@keyframes gmsh{0%{background-position:200% 0}100%{background-position:-200% 0}}
.gm-overlay{position:fixed;inset:0;background:rgba(8,41,82,.4);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px}
.gm-modal{width:100%;max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(8,41,82,.25);display:flex;flex-direction:column}
.gm-modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #eef3f5;font-size:13px;color:#51637b}
.gm-modal-head strong{color:var(--acc)}
.gm-modal-head button{border:none;background:none;cursor:pointer;color:#9aa7b8;font-size:15px}
.gm-f{display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid #f1f5f7}
.gm-f span{width:56px;font-size:11.5px;font-weight:600;color:#9aa7b8}
.gm-f input{flex:1;padding:12px 0;border:none;outline:none;font-size:13px;font-family:inherit;color:#26374d}
.gm-body{min-height:200px;max-height:40vh;padding:14px 18px;border:none;outline:none;resize:vertical;font-size:13.5px;font-family:inherit;line-height:1.6;color:#26374d}
.gm-modal-err{margin:0 18px 10px;padding:9px 12px;border-radius:9px;font-size:12px;color:#c0362c;background:#fdecea}
.gm-modal-foot{display:flex;justify-content:flex-end;gap:10px;padding:14px 18px;border-top:1px solid #eef3f5}
.gm-ghost{padding:9px 18px;border:1px solid #dce6eb;background:#fff;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer;color:#51637b;font-family:inherit}
.gm-send{padding:9px 22px;border:none;background:var(--acc);color:#fff;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}
.gm-send:disabled,.gm-ghost:disabled{opacity:.6}
`;
