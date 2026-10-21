import type { Material } from "@/lib/types";

export const PRODUCT_LINES = [
  "ALUMINUM_SLIM_SYSTEM",
  "ALUMINUM_DOORS",
  "ALUMINUM_ALUCOBOND"
] as const;

export type ProductLine = (typeof PRODUCT_LINES)[number];

export function isProductLine(value: string): value is ProductLine {
  return (PRODUCT_LINES as readonly string[]).includes(value);
}

export const PRODUCT_LINE_LABELS: Record<ProductLine, { ar: string; en: string }> = {
  ALUMINUM_SLIM_SYSTEM: { ar: "نظام سلم (Slim System)", en: "Slim System" },
  ALUMINUM_DOORS: { ar: "ألمنيوم وزجاج", en: "Aluminum & Glass" },
  ALUMINUM_ALUCOBOND: { ar: "ألوكوبوند", en: "Alucobond" }
};

// Which lines apply to which material — Steel has none, so the line
// filter/field just doesn't render for it.
export const MATERIAL_PRODUCT_LINES: Partial<Record<Material, ProductLine[]>> = {
  ALUMINUM: ["ALUMINUM_DOORS", "ALUMINUM_SLIM_SYSTEM", "ALUMINUM_ALUCOBOND"]
};

// URL segment for each line under its material's /catalog/[material]/...
// route (e.g. /catalog/aluminum/aluminum-glass).
export const PRODUCT_LINE_SLUGS: Record<ProductLine, string> = {
  ALUMINUM_SLIM_SYSTEM: "slim-system",
  ALUMINUM_DOORS: "aluminum-glass",
  ALUMINUM_ALUCOBOND: "alucobond"
};

// Reverse lookup used by /catalog/[material]/[slug] to tell a sub-line
// listing (e.g. "aluminum-glass") apart from an actual product slug — only the
// lines that apply to that material are considered.
export function productLineForSlug(material: Material, slug: string): ProductLine | undefined {
  return (MATERIAL_PRODUCT_LINES[material] ?? []).find((line) => PRODUCT_LINE_SLUGS[line] === slug);
}
