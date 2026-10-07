// Media uploads via Cloudinary. Env-gated and no-throw: when Cloudinary keys are
// present, files are uploaded to Cloudinary and the secure URL is returned; with
// no keys it falls back to writing to local /public/uploads so the platform keeps
// working with zero configuration.
import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

type UploadResult = { ok: boolean; url: string; provider: "cloudinary" | "local"; publicId?: string; error?: string };

const cloud = () => ({
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
});

export function cloudinaryEnabled() {
  const c = cloud();
  return !!(c.name && c.key && c.secret);
}

// Cloudinary signed upload (no SDK dependency — uses their REST endpoint).
async function uploadToCloudinary(buffer: Buffer, folder: string, filename: string): Promise<UploadResult> {
  const c = cloud();
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + c.secret).digest("hex");

  const form = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  form.append("file", blob, filename);
  form.append("api_key", c.key!);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.name}/auto/upload`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || !data.secure_url) return { ok: false, url: "", provider: "cloudinary", error: data?.error?.message ?? `HTTP ${res.status}` };
  return { ok: true, url: data.secure_url, provider: "cloudinary", publicId: data.public_id };
}

async function uploadToLocal(buffer: Buffer, folder: string, filename: string): Promise<UploadResult> {
  const safe = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safe), buffer);
  return { ok: true, url: `/uploads/${folder}/${safe}`, provider: "local" };
}

/** Upload a file buffer. Returns a public URL (Cloudinary when configured, else local disk). */
export async function uploadMedia(buffer: Buffer, folder = "forcepk", filename = "upload"): Promise<UploadResult> {
  try {
    if (cloudinaryEnabled()) return await uploadToCloudinary(buffer, folder, filename);
    return await uploadToLocal(buffer, folder, filename);
  } catch (e) {
    return { ok: false, url: "", provider: cloudinaryEnabled() ? "cloudinary" : "local", error: String(e) };
  }
}
