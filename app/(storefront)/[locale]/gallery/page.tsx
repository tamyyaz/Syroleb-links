import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import Reveal from "@/components/motion/Reveal";
import GalleryGrid from "@/components/GalleryGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  return {
    title: dict.gallery.title,
    description: dict.gallery.subtitle,
    alternates: { languages: { ar: "/ar/gallery", en: "/en/gallery" } },
    openGraph: { title: dict.gallery.title, description: dict.gallery.subtitle }
  };
}

export default async function GalleryPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const photos = await prisma.galleryImage.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="container-page py-16">
      <Reveal>
        <span className="eyebrow">{dict.gallery.eyebrow}</span>
        <h1 className="font-display mb-2 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.gallery.title}</h1>
        <p className="mb-10 max-w-xl text-ink-800/70">{dict.gallery.subtitle}</p>
      </Reveal>

      {photos.length === 0 ? (
        <p className="py-16 text-center text-ink-800/60">{dict.gallery.empty}</p>
      ) : (
        <GalleryGrid photos={photos.map((p) => ({ id: p.id, url: p.url }))} dict={dict} />
      )}
    </div>
  );
}
