// Public base URL of the site (no trailing slash). Set NEXT_PUBLIC_SITE_URL
// once a final domain exists; until then, on Vercel the production
// deployment's own domain is used, and locally http://localhost:3000.
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;
  return "http://localhost:3000";
}
