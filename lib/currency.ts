// The only currencies the site supports: US dollar and Syrian pound.
// DEFAULT_CURRENCY is also the single base currency of the internal system
// (invoices, payments, salaries) and the accounting module.
export const CURRENCIES = ["USD", "SYP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "USD";

export const CURRENCY_LABELS: Record<Currency, { ar: string; en: string }> = {
  USD: { ar: "دولار أمريكي (USD)", en: "US Dollar (USD)" },
  SYP: { ar: "ليرة سورية (SYP)", en: "Syrian Pound (SYP)" }
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}
