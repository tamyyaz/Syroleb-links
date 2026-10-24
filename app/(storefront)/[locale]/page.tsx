import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { getAllSiteSettings } from "@/lib/siteContent";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import ServicesGrid from "@/components/ServicesGrid";
import GalleryPreview from "@/components/GalleryPreview";
import BrandStatement from "@/components/BrandStatement";
import QualityFeatures from "@/components/QualityFeatures";
import CTASection from "@/components/CTASection";
import { getSiteUrl } from "@/lib/siteUrl";

export default async function HomePage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const { hero, stats, services, quality, cta, footer } = await getAllSiteSettings();

  const siteUrl = getSiteUrl();
  // LocalBusiness (not the more generic Organization) — the branches are
  // physical locations customers visit, so this is eligible for local-
  // search treatment (map pack, knowledge panel) that Organization isn't.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "SYROLEB",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-mark.png`,
    ...(footer.email ? { email: footer.email } : {}),
    contactPoint: footer.locations.map((loc) => ({
      "@type": "ContactPoint",
      telephone: `+${loc.phone}`,
      contactType: "sales",
      areaServed: loc.name[locale]
    })),
    address: footer.locations.map((loc) => ({
      "@type": "PostalAddress",
      streetAddress: loc.address[locale],
      addressLocality: loc.name[locale]
    }))
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero dict={dict} locale={locale} content={hero} />
      <StatsBar locale={locale} content={stats} />
      <ServicesGrid locale={locale} content={services} />

      <GalleryPreview locale={locale} dict={dict} />

      <BrandStatement locale={locale} />
      <QualityFeatures locale={locale} content={quality} />
      <CTASection dict={dict} locale={locale} content={cta} />
    </div>
  );
}
