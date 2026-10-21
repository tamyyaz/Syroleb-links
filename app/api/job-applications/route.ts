import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const applicationSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  applicantName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  yearsExperience: z.string().min(1).max(200),
  reasonJoining: z.string().min(1).max(2000),
  previousWorkplaces: z.string().max(500).optional(),
  certificates: z.string().max(500).optional(),
  extraMessage: z.string().max(2000).optional()
});

// Kept separate from /api/orders — a job application used to be folded into
// Order.message as one free-text blob, mixing candidates into the same
// admin list/print flow as product orders and quote requests. Applications
// are stored in the database and read from /admin/job-applications.
export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = applicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const application = await prisma.jobApplication.create({ data });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
