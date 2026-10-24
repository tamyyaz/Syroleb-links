import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import Reveal from "./motion/Reveal";

// Homepage teaser: the latest photos plus a link to the full gallery.
// Renders nothing until the first photo is added.
export default async function GalleryPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const latest = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  if (latest.length === 0) return null;

  return (
    <section className="bg-sage-300 py-16">
      <div className="container-page">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">{dict.gallery.eyebrow}</span>
              <h2 className="font-display mt-2 text-3xl text-ink-900 sm:text-4xl">{dict.gallery.title}</h2>
            </div>
            <Link href={`/${locale}/gallery`} className="btn-primary">
              {dict.gallery.view_all}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {latest.map((photo) => (
              <Link
                key={photo.id}
                href={`/${locale}/gallery`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sage-200"
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
