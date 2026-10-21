# Syroleb — موقع سيروليب

متجر إلكتروني كامل (كتالوج منتجات ألمنيوم) + وظائف + نظام داخلي ومحاسبة، مبني بـ **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma**.

## المزايا المنفذة

- **ديزاين مخصص** مبني على الشعار الرسمي لسيروليب (رمادي فحمي/بيج حجري)، بأزرار دائرية، خط عناوين مميز، وحركات سينمائية خفيفة.
- **معرض/كتالوج منتجات** مع فلترة حسب الفئة والخامة والسعر، وصفحة مخصصة لكل فئة.
- **قسم الوظائف الشاغرة** (`/careers`) بنظام تقديم مدمج بنفس نظام الطلبات.
- **دعم لغتين (عربي/إنجليزي)** مع تبديل تلقائي لاتجاه الصفحة RTL/LTR.
- **لوحة تحكم للإدارة** بثلاث صلاحيات (مسؤول/مدير/موظف)، محمية بتسجيل دخول: إضافة/تعديل/حذف منتجات ووظائف، عرض الطلبات، إدارة محتوى الموقع، وإدارة المساعد الذكي.
- **تواصل مباشر**: زر واتساب عائم + فورم طلب/تواصل بكل صفحة منتج وصفحة التواصل.
- **إرسال الطلب تلقائياً بالإيميل** فور تعبئة أي فورم طلب، مع حفظ كل طلب بقاعدة البيانات حتى لو فشل الإيميل.
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
| الإيميل | Nodemailer عبر SMTP |
| الاستضافة | Firebase (`syroleb-links.web.app`) + GitHub Actions |

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
lib/                        منطق مشترك (i18n، auth، أدوار الإدارة، mailer، prisma...)
prisma/
  schema.prisma             نموذج قاعدة البيانات (PostgreSQL)
  seed.ts                   بيانات تجريبية (فئات + منتجات + قاعدة معرفة + أدمن)
```

## التشغيل المحلي

```bash
npm install
cp .env.example .env
# عدّل DATABASE_URL و DIRECT_URL (Supabase), ADMIN_SESSION_SECRET, بيانات SMTP

npx prisma db push
npm run db:seed         # بيانات تجريبية + مستخدم أدمن (اسم المستخدم admin)
npm run dev             # http://localhost:3000
```

لوحة التحكم: `http://localhost:3000/admin/login`

## النشر — Firebase + GitHub

الدومين: `https://syroleb-links.web.app`. لوحة الإدارة والنظام الداخلي والمحاسبة على نفس الدومين تحت `/admin` و`/system` و`/accounting` (بدون نطاقات فرعية).

- **قاعدة البيانات:** Supabase Postgres — ضع `DATABASE_URL` (pooler، المنفذ 6543) و`DIRECT_URL` (المنفذ 5432). الجداول تنشأ بـ `npx prisma db push`.
- **تخزين الصور والـ PDF:** Supabase Storage — أنشئ bucket عام باسم `uploads` وضع `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY`.
- **المهام المجدولة:** `.github/workflows/cron.yml` (تنبيهات يومية وتقرير وباك أب أسبوعي). تحتاج secret باسم `CRON_SECRET` ومتغير `SITE_URL` بإعدادات المستودع.
- **النشر من GitHub:** قيد الإعداد (بانتظار مفتاح خدمة Firebase).

## قبل الإنتاج — قائمة تحقق سريعة

1. ولّد `ADMIN_SESSION_SECRET` عشوائي وحقيقي (وليس القيمة الافتراضية).
2. تأكد إن حساب الأدمن الافتراضي غيّر كلمة مروره من `/admin` بعد أول دخول.
3. تأكد من `DATABASE_URL` يشاور على قاعدة بيانات إنتاج حقيقية (مو placeholder).
4. راجع رقم الواتساب والأرقام بالفوتر (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
5. فعّل الذكاء الاصطناعي (اختياري) وجرّب كذا سؤال قبل الاعتماد عليه بالكامل.
