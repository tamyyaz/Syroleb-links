import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

// Internal apps live under their own path prefixes on the same domain
// (Firebase Hosting gives a single web.app host, so no subdomains):
//   /admin       admin panel (app/(admin-app)/admin/...)
//   /system      internal system — quotes, invoices, employees, etc.
//                (app/(system-app)/system/...)
//   /accounting  formal accounting module, OWNER-only, reuses the same
//                SystemUser login as /system (see lib/systemAuth.ts) but
//                requires its own sign-in step
// These prefixes are served as-is (no locale prefix), as is /api.
const APP_PREFIXES = ["/admin", "/system", "/accounting"];

// Public site: "/" -> "/ar" (default locale) so every public page lives
// under /ar/... or /en/....
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
