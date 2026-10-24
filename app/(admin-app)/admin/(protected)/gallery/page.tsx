import { prisma } from "@/lib/prisma";
import { requirePageRole } from "@/lib/requirePageRole";
import GalleryManager from "@/components/admin/GalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requirePageRole("gallery");

  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-ink-900">معرض الصور</h1>
      <p className="mb-6 text-sm text-ink-800/60">
        الصور بتظهر بصفحة المعرض بالموقع بنفس ترتيب الإضافة. بتقدر تختار عدة صور مرة وحدة، وبتنضغط تلقائياً قبل الرفع.
      </p>
      <GalleryManager initial={images.map((i) => ({ id: i.id, url: i.url }))} />
    </div>
  );
}
