"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; url: string };

const MAX_SIDE = 1800;

// Phone photos are 3-8MB each — shrink to a web-sized JPEG in the browser
// before uploading (faster on a weak connection, and well under the 5MB
// upload limit). Falls back to the original file if the browser can't
// decode it; GIFs are left untouched to keep their animation.
async function prepare(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function GalleryManager({ initial }: { initial: Item[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<Item | null> {
    try {
      const form = new FormData();
      form.append("file", await prepare(file));
      const up = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (!up.ok) return null;
      const { url } = await up.json();
      const created = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (!created.ok) return null;
      const image = await created.json();
      return { id: image.id, url: image.url };
    } catch {
      return null;
    }
  }

  async function handleFiles(files: FileList) {
    const list = Array.from(files);
    setFailed(0);
    setProgress({ done: 0, total: list.length });
    // One at a time so the photos keep the order they were picked in.
    let bad = 0;
    for (let i = 0; i < list.length; i++) {
      const added = await uploadOne(list[i]);
      if (added) setItems((prev) => [...prev, added]);
      else bad++;
      setProgress({ done: i + 1, total: list.length });
    }
    setFailed(bad);
    setProgress(null);
    router.refresh();
  }

  async function remove(id: string) {
    setConfirmId(null);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const busy = progress !== null;

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          disabled={busy}
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm text-ink-800 file:me-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-800"
        />
        {progress && (
          <div className="mt-4">
            <div className="mb-1 text-sm text-ink-800/70">
              جاري الرفع… {progress.done} / {progress.total} (لا تغلق الصفحة)
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full bg-brand-700 transition-all"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {!busy && failed > 0 && (
          <p className="mt-3 text-sm text-red-700">
            تعذر رفع {failed} صورة (الشبكة أو نوع الملف). اختارها وارفعها مرة تانية.
          </p>
        )}
      </div>

      <div className="text-sm font-semibold text-ink-800/70">عدد الصور: {items.length}</div>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-ink-800/60">لا يوجد صور بعد</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="card relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              {confirmId === item.id ? (
                <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/70 p-2">
                  <button
                    onClick={() => remove(item.id)}
                    className="flex-1 rounded-lg bg-red-600 px-2 py-1.5 text-xs font-semibold text-white"
                  >
                    تأكيد الحذف
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-lg bg-white/90 px-2 py-1.5 text-xs font-semibold text-ink-900"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(item.id)}
                  aria-label="حذف"
                  className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow hover:bg-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
