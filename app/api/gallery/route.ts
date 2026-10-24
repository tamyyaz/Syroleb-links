import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

export const dynamic = "force-dynamic";

// Public: the gallery photos, in the order they were added.
export async function GET() {
  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(images);
}

const createSchema = z.object({ url: z.string().url() });

// Admin-only: register an already-uploaded photo (see /api/admin/upload).
export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const image = await prisma.galleryImage.create({ data: { url: parsed.data.url } });
  return NextResponse.json(image, { status: 201 });
}
