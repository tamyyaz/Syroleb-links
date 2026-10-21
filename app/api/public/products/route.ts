import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public, read-only, CORS-enabled catalog feed for the SYROLEB mobile app —
// deliberately a separate route from /api/products, which is an internal
// endpoint (used by the system/admin quote builder's product picker) with
// a different shape; changing that one would break it.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  const items = products.map((p) => ({
    id: p.id,
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    category: p.material,
    material: p.material,
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    price: p.price,
    currency: p.currency,
    mainImageUrl: p.images[0]?.url ?? null,
    available: p.inStock
  }));

  return NextResponse.json(items, { headers: corsHeaders });
}
