import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  return {
    title: dict.products.title,
    description: dict.products.choose_section,
    alternates: { languages: { ar: "/ar/catalog", en: "/en/catalog" } },
    openGraph: { title: dict.products.title, description: dict.products.choose_section }
  };
}

export default async function CatalogChooserPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);

  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  const aluminum = categories.find((c) => c.slug === "aluminum");

  type Card = { href: string; name: string; image: string | undefined };
  const cards: Card[] = [];
  if (aluminum) {
    cards.push({
      href: `/${locale}/catalog/aluminum`,
      name: locale === "ar" ? aluminum.nameAr : aluminum.nameEn,
      image: aluminum.heroImage ?? undefined
    });
  }

  return (
    <div className="container-page py-16">
      <Reveal>
        <span className="eyebrow">{dict.products.eyebrow}</span>
        <h1 className="font-display mb-2 mt-2 text-3xl text-ink-900 sm:text-5xl">{dict.products.title}</h1>
        <p className="mb-10 max-w-xl text-ink-800/70">{dict.products.choose_section}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.href} delay={i * 0.08}>
            <Link href={card.href} className="card-interactive group block overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-sage-300 text-ink-800/40">
                    {card.name}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <h2 className="font-semibold text-ink-900">{card.name}</h2>
                <span className="text-sm font-medium text-brand-600">{dict.products.explore_section}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
