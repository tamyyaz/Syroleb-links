import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminApi";

// Admin-only: remove a photo from the gallery.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.galleryImage.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
