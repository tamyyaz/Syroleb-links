import type { Metadata } from "next";
import { cairo } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Syroleb — النظام الداخلي",
  robots: { index: false, follow: false }
};

// Root layout for the whole /system app (rewritten to /system
// by middleware.ts). Kept Arabic/RTL by default, same as the /admin panel —
// the auth gate + sidebar chrome lives in the nested (protected)/layout.tsx
// so /system/login can render without it.
export default function SystemRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-sage-50">{children}</body>
    </html>
  );
}
