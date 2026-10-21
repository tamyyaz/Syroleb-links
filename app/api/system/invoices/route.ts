import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSystemUser } from "@/lib/systemApi";
import { logAudit } from "@/lib/auditLog";
import { deductStockForItems } from "@/lib/inventory";
import { postInvoiceCreated } from "@/lib/autoPosting";
import { formatInvoiceNumber } from "@/lib/invoices";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export async function GET() {
  const { response } = await requireSystemUser();
  if (response) return response;

  const invoices = await prisma.invoice.findMany({ orderBy: { invoiceNumber: "desc" } });
  return NextResponse.json(invoices);
}

async function nextInvoiceNumber(): Promise<number> {
  const last = await prisma.invoice.findFirst({ orderBy: { invoiceNumber: "desc" }, select: { invoiceNumber: true } });
  return (last?.invoiceNumber ?? 0) + 1;
}

// exchangeRate = how many units of the quote's currency equal 1 unit of the
// base currency (e.g. 15000 SYP per 1 USD) — required only when the quote
// isn't priced in the base currency.
const createSchema = z.object({
  quoteId: z.string().min(1),
  exchangeRate: z.number().positive().finite().optional()
});

const round2 = (n: number) => Math.round(n * 100) / 100;

// Invoices are created FROM an accepted Quote — "convert to invoice" — not
// built line-by-line from scratch (that's what a Quote already is). Every
// number is snapshotted at this moment: editing the source Quote afterward
// must never change an already-issued invoice.
export async function POST(request: NextRequest) {
  const { session, response } = await requireSystemUser();
  if (response) return response;

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: parsed.data.quoteId },
    include: { items: { orderBy: { position: "asc" } } }
  });
  if (!quote) {
    return NextResponse.json({ error: "quote_not_found" }, { status: 404 });
  }

  // Invoices, payments and the ledger are kept in one base currency — a quote
  // priced in another currency is converted at the rate given right now and
  // the original amount is kept in the invoice note.
  const needsConversion = quote.currency !== DEFAULT_CURRENCY;
  const rate = parsed.data.exchangeRate;
  if (needsConversion && !rate) {
    return NextResponse.json({ error: "exchange_rate_required", currency: quote.currency }, { status: 400 });
  }
  const toBase = (value: number) => (needsConversion && rate ? round2(value / rate) : value);

  const invoiceNumber = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      quoteId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: quote.items.map((i) => ({
        productId: i.productId,
        descriptionAr: i.descriptionAr,
        descriptionEn: i.descriptionEn,
        quantity: i.quantity,
        unitPrice: toBase(i.unitPrice),
        discountPercent: i.discountPercent,
        lineTotal: toBase(i.lineTotal)
      })),
      subtotal: toBase(quote.subtotal),
      totalAmount: toBase(quote.grandTotal),
      note:
        needsConversion && rate
          ? `محوّلة من عرض سعر بالـ ${quote.currency} (الإجمالي ${quote.grandTotal.toFixed(2)} ${quote.currency}) بسعر صرف ${rate} ${quote.currency} لكل 1 ${DEFAULT_CURRENCY}`
          : undefined
    }
  });

  // A converted quote is a confirmed sale — deduct the sold quantities from
  // warehouse stock automatically (items with no catalog product behind
  // them, i.e. free-text lines, are skipped — see lib/inventory.ts).
  await deductStockForItems(
    quote.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    `بيع — فاتورة #${formatInvoiceNumber(invoiceNumber)}`
  );

  // Best-effort — see lib/autoPosting.ts. Never blocks the invoice itself;
  // requires the starter chart of accounts (or equivalent account codes)
  // to already exist, otherwise this quietly does nothing.
  try {
    await postInvoiceCreated(invoice);
  } catch (err) {
    console.error("Failed to auto-post invoice to accounting ledger:", err);
  }

  await logAudit(session!.email, "create", "Invoice", invoice.id, `إضافة فاتورة #${invoice.invoiceNumber}: ${invoice.customerName}`);
  return NextResponse.json(invoice, { status: 201 });
}
