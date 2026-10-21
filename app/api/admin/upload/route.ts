import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/adminApi";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10MB

// SVG is deliberately excluded — it can carry embedded <script>, unlike
// raster formats, and this is served back to visitors' browsers directly.
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf"
};

// Admin-only image/PDF upload (logo, hero background, product photos,
// catalogs, etc.) — stored in a public Supabase Storage bucket and returns
// its public URL. Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
// (optionally) SUPABASE_STORAGE_BUCKET, default "uploads" — the bucket must
// exist and be public. A local-disk write here would not work on a
// serverless host: the filesystem is ephemeral, so anything written at
// runtime never persists. The filename is always server-generated (never
// the client-supplied name) to rule out path traversal or extension-spoofing.
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
  }

  const maxBytes = file.type === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "storage_not_configured" }, { status: 500 });
  }

  const filename = `${randomUUID()}.${ext}`;
  const upload = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filename}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": file.type,
      "x-upsert": "false"
    },
    body: Buffer.from(await file.arrayBuffer())
  });
  if (!upload.ok) {
    console.error("Supabase upload failed:", upload.status, await upload.text().catch(() => ""));
    return NextResponse.json({ error: "upload_failed" }, { status: 502 });
  }

  return NextResponse.json({ url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}` }, { status: 201 });
}
