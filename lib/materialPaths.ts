import type { Material } from "@/lib/types";
import type { CatalogsContent } from "@/lib/siteContent";

// Each material gets its own section nested under /catalog — this is the
// single source of truth for that mapping, used by /catalog/[material] and
// /catalog/[material]/[slug], internal links (ProductCard, CategorySpotlight,
// cart, sitemap), and the legacy /aluminum, /products/[slug] redirectors.
export const MATERIAL_PATHS: Record<Material, string> = {
  ALUMINUM: "catalog/aluminum",
  STEEL: "products" // no dedicated section (not offered as a catalog line today) — falls back to the generic catalog
};

// The single path segment identifying each material within /catalog/[material]
// routes — same values as MATERIAL_PATHS minus the "catalog/" prefix, kept
// separate because the dynamic route needs to go from segment back to
// Material (MATERIAL_PATHS only goes the other way).
export const MATERIAL_SLUGS: Record<Material, string> = {
  ALUMINUM: "aluminum",
  STEEL: "products"
};

export function materialForSlug(slug: string): Material | undefined {
  return (Object.keys(MATERIAL_SLUGS) as Material[]).find((m) => MATERIAL_SLUGS[m] === slug);
}

// Real /catalog/[material] sections only — STEEL's MATERIAL_SLUGS entry
// ("products") is just materialPaths' fallback for a material with no
// dedicated section, not an actual /catalog/products route.
export const CATALOG_MATERIALS: Material[] = ["ALUMINUM"];

export function resolveCatalogMaterial(slug: string): Material | null {
  const material = materialForSlug(slug);
  return material && CATALOG_MATERIALS.includes(material) ? material : null;
}

// Admin-uploaded catalog PDF (SiteSetting "catalogs") key per material —
// see components/admin/SiteSettingEditor.tsx's CatalogsEditor.
export const CATALOG_PDF_KEY: Record<Material, keyof CatalogsContent> = {
  ALUMINUM: "aluminum",
  STEEL: "aluminum" // unreachable — STEEL is excluded by CATALOG_MATERIALS above
};

export const MATERIAL_CATEGORY_SLUGS: Record<Material, string> = {
  ALUMINUM: "aluminum",
  STEEL: "aluminum"
};

export function productPath(material: Material, slug: string) {
  return `/${MATERIAL_PATHS[material]}/${slug}`;
}

const CATEGORY_SLUG_TO_SECTION_PATH: Record<string, string> = {
  "aluminum": MATERIAL_PATHS.ALUMINUM
};

// Homepage spotlight buttons link to a Category (not a Material directly)
// — same mapping, keyed by category slug instead.
export function categoryPath(categorySlug: string) {
  return `/${CATEGORY_SLUG_TO_SECTION_PATH[categorySlug] ?? "catalog"}`;
}
