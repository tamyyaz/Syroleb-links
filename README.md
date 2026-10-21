# Syroleb — موقع سيروليب

متجر إلكتروني كامل (كتالوج منتجات ألمنيوم) + وظائف + نظام داخلي ومحاسبة، مبني بـ **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma**.

## المزايا المنفذة

- **ديزاين مخصص** مبني على الشعار الرسمي لسيروليب (رمادي فحمي/بيج حجري)، بأزرار دائرية، خط عناوين مميز، وحركات سينمائية خفيفة.
- **معرض/كتالوج منتجات** مع فلترة حسب الفئة والخامة والسعر، وصفحة مخصصة لكل فئة.
- **قسم الوظائف الشاغرة** (`/careers`) بنظام تقديم مدمج بنفس نظام الطلبات.
- **دعم لغتين (عربي/إنجليزي)** مع تبديل تلقائي لاتجاه الصفحة RTL/LTR.
- **لوحة تحكم للإدارة** بثلاث صلاحيات (مسؤول/مدير/موظف)، محمية بتسجيل دخول: إضافة/تعديل/حذف منتجات ووظائف، عرض الطلبات، إدارة محتوى الموقع، وإدارة المساعد الذكي.
- **تواصل مباشر**: زر واتساب عائم + فورم طلب/تواصل بكل صفحة منتج وصفحة التواصل.
- **إشعار الطلبات عبر واتساب** (اختياري، Green API) مع حفظ كل طلب بقاعدة البيانات دائماً.
- **تصدير كتالوج PDF** من لوحة التحكم.
- **SEO**: `robots.txt`، `sitemap.xml` ديناميكي، عناوين ووصف مخصصة لكل صفحة، Open Graph، hreflang، وبيانات Organization المهيكلة (JSON-LD).
- **مساعد ذكاء اصطناعي (اختياري)**: زر عائم بالموقع يجاوب زوار الموقع من قاعدة معرفة يديرها الأدمن + كتالوج المنتجات الحالي.

## البنية التقنية

| الطبقة | التقنية |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| اللغة | TypeScript |
| التنسيق | Tailwind CSS |
| الأنيميشن | Framer Motion |
| قاعدة البيانات | Prisma ORM — PostgreSQL (Supabase) |
| تخزين الملفات | Supabase Storage |
| المصادقة (الإدارة) | جلسة موقّعة بـ JWT (jose) + كوكي httpOnly، كلمات مرور مشفّرة bcrypt |
| الاستضافة | Vercel (ربط مباشر مع GitHub) |

## هيكل المشروع

```
app/
  (storefront)/[locale]/    الموقع العام (رئيسية، كتالوج، وظائف، من نحن، تواصل) — ثنائي اللغة
  (admin-app)/admin/        لوحة التحكم /admin (محمية بتسجيل دخول + صلاحيات)
  (system-app)/system/      النظام الداخلي /system (عروض أسعار، فواتير، موظفين، مخزن)
  (accounting-app)/accounting/  المحاسبة /accounting (للمالك فقط)
  api/                      كل الـ API routes
  robots.ts, sitemap.ts     ملفات SEO
components/                 مكونات الواجهة (عامة + لوحة الإدارة)
lib/                        منطق مشترك (i18n، auth، أدوار الإدارة، prisma...)
prisma/
  schema.prisma             نموذج قاعدة البيانات (PostgreSQL)
  seed.ts                   بيانات تجريبية (فئات + منتجات + قاعدة معرفة + أدمن)
```

## التشغيل المحلي

```bash
npm install
cp .env.example .env
# عدّل DATABASE_URL و DIRECT_URL (Supabase), ADMIN_SESSION_SECRET, 

npx prisma db push
npm run db:seed         # بيانات تجريبية + مستخدم أدمن (اسم المستخدم admin)
npm run dev             # http://localhost:3000
```

لوحة التحكم: `http://localhost:3000/admin/login`

## النشر — Vercel

الكود على GitHub والاستضافة على **Vercel** (ربط مباشر: كل دفعة على `main` بتنشر تلقائياً). لوحة الإدارة والنظام الداخلي والمحاسبة على نفس الدومين تحت `/admin` و`/system` و`/accounting`.

1. من vercel.com سجّل الدخول بحساب GitHub واعمل **Add New Project** واختر هذا المستودع (فرع `main`).
2. أضف متغيرات البيئة من `.env.example` في Settings ثم Environment Variables (على الأقل: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`, `SYSTEM_SESSION_SECRET`).
3. **قاعدة البيانات:** Supabase Postgres. لإنشاء الجداول والبيانات الأولية شغّل من GitHub: Actions ثم **Database setup** ثم Run workflow (تحتاج أسرار المستودع `DATABASE_URL`, `DIRECT_URL`, `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD`).
4. **تخزين الصور والـ PDF:** Supabase Storage — bucket عام باسم `uploads`.
5. **النظام الداخلي:** بعد أول نشر، أرسل طلب POST لـ `/api/system/bootstrap` لإنشاء حساب المالك من `SYSTEM_OWNER_EMAIL/PASSWORD`.
6. **الدومين:** افتراضياً `*.vercel.app`، وتقدر تربط دومين خاص (DNS على Cloudflare مثلاً) من Settings ثم Domains.

## قبل الإنتاج — قائمة تحقق سريعة

1. ولّد `ADMIN_SESSION_SECRET` عشوائي وحقيقي (وليس القيمة الافتراضية).
2. تأكد إن حساب الأدمن الافتراضي غيّر كلمة مروره من `/admin` بعد أول دخول.
3. تأكد من `DATABASE_URL` يشاور على قاعدة بيانات إنتاج حقيقية (مو placeholder).
4. راجع رقم الواتساب والأرقام بالفوتر (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
5. فعّل الذكاء الاصطناعي (اختياري) وجرّب كذا سؤال قبل الاعتماد عليه بالكامل.
