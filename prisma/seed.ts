import { randomBytes } from "crypto";
import { Material, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SITE_SETTING_DEFAULTS } from "../lib/siteContent";

const prisma = new PrismaClient();

async function main() {
  // --- Categories: the Syroleb product lines ---
  const categories = [
    {
      slug: "aluminum-doors",
      nameAr: "أبواب ألمنيوم",
      nameEn: "Aluminum Doors",
      taglineAr: "أبواب سيروليب عالية الأداء",
      taglineEn: "Syroleb's high performance doors",
      descriptionAr:
        "مصنوعة لأعلى درجات الأمان وبتأثير معماري مميز، تقدّم أبواب الألمنيوم الثقيلة لدينا قوة لا تُخترق مع هيبة جمالية خالدة لحماية عقارك وتمييزه.",
      descriptionEn:
        "Crafted for ultimate security and striking architectural impact, our heavy-duty Aluminum doors offer impenetrable strength combined with timeless aesthetic prestige to protect and distinguish your property.",
      heroImage: "https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?w=1200"
    }
  ];

  const createdCategories = [];
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c
    });
    createdCategories.push(cat);
  }

  const [aluminum] = createdCategories;

  // --- Sample products ---
  const products = [
    {
      slug: "aluminum-security-door-pro",
      nameAr: "باب ألمنيوم أمني بروفيشنال",
      nameEn: "Aluminum Security Door Pro",
      descriptionAr: "باب ألمنيوم ثقيل مقاوم للاختراق بمتعدد نقاط قفل، مناسب للمداخل الرئيسية والمشاريع التجارية.",
      descriptionEn: "Heavy-duty impact-resistant aluminum door with multi-point locking, ideal for main entrances and commercial projects.",
      categoryId: aluminum.id,
      material: Material.ALUMINUM,
      price: 4200,
      featured: true,
      images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200"]
    },
    {
      slug: "aluminum-architectural-door",
      nameAr: "باب ألمنيوم معماري فاخر",
      nameEn: "Aluminum Architectural Door",
      descriptionAr: "تصميم معماري مميز بطلاء إلكتروستاتيك، يجمع بين القوة والهيبة الجمالية لواجهات العقارات الفاخرة.",
      descriptionEn: "Distinctive architectural design with electrostatic coating, combining strength with aesthetic prestige for premium property facades.",
      categoryId: aluminum.id,
      material: Material.ALUMINUM,
      price: 5100,
      featured: false,
      images: ["https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200"]
    }
  ];

  for (const p of products) {
    const { images, ...rest } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: rest,
      create: rest
    });

    const existingImages = await prisma.productImage.count({
      where: { productId: product.id }
    });
    if (existingImages === 0) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({
          url,
          alt: p.nameEn,
          position: i,
          productId: product.id
        }))
      });
    }
  }

  // --- Starter knowledge base for the AI assistant ---
  const knowledgeEntries = [
    {
      category: "faq",
      title: "مدة التوصيل والتركيب",
      content:
        "مدة التوصيل والتركيب عادة بين 7 إلى 14 يوم عمل حسب نوع الباب والكمية والموقع، ونأكد الموعد الدقيق مع العميل بعد تأكيد الطلب."
    },
    {
      category: "faq",
      title: "الضمان",
      content:
        "كل منتجات سيروليب مغطاة بضمان شامل يبدأ من تاريخ التركيب (المدة تختلف حسب نوع المنتج)، ويغطي عيوب الصناعة والتركيب."
    },
    {
      category: "policy",
      title: "مناطق التغطية",
      content:
        "نغطي عدة مناطق ونوصّل ونركّب حسب الاتفاق مع العميل. للاستفسار عن منطقتك تواصل معنا عبر واتساب."
    }
  ];

  for (const entry of knowledgeEntries) {
    const existing = await prisma.knowledgeEntry.findFirst({ where: { title: entry.title } });
    if (!existing) {
      await prisma.knowledgeEntry.create({ data: entry });
    }
  }

  // --- Starter customer types for quote line-item discounts (percentages
  // are placeholders — the admin tunes these from /admin/customer-types) ---
  const customerTypes = [
    { nameAr: "وكيل", nameEn: "Agent", discountPercent: 20 },
    { nameAr: "تاجر", nameEn: "Trader", discountPercent: 15 },
    { nameAr: "مهندس", nameEn: "Engineer", discountPercent: 10 },
    { nameAr: "عميل", nameEn: "Client", discountPercent: 5 }
  ];
  for (const ct of customerTypes) {
    const existing = await prisma.customerType.findFirst({ where: { nameAr: ct.nameAr } });
    if (!existing) {
      await prisma.customerType.create({ data: ct });
    }
  }

  // --- Site content CMS defaults (one row per homepage/footer section) ---
  for (const [key, value] of Object.entries(SITE_SETTING_DEFAULTS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: JSON.stringify(value) }
    });
  }

  // --- Default admin user ---
  // No password is hardcoded in source control. Set DEFAULT_ADMIN_USERNAME /
  // DEFAULT_ADMIN_PASSWORD in .env to choose your own on first seed;
  // otherwise a strong one-time random password is generated and printed
  // ONCE below — copy it immediately, then change it from /admin after
  // logging in (it is not recoverable afterwards; re-seeding an existing
  // admin never overwrites their password).
  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: defaultUsername }
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await prisma.admin.create({
      data: { username: defaultUsername, passwordHash, role: "SUPER_ADMIN" }
    });
    console.log(
      `\nCreated default admin user:\n  username: ${defaultUsername}\n  password: ${defaultPassword}\n` +
        `⚠️  Save this now — it will not be shown again. Change it from /admin immediately after logging in.\n`
    );
  } else {
    console.log(`Admin user "${defaultUsername}" already exists — skipped (password left untouched).`);
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
