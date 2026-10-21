"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEFAULT_CURRENCY } from "@/lib/currency";

export default function ConvertToInvoiceButton({ quoteId, currency }: { quoteId: string; currency: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState("");
  const needsRate = currency !== DEFAULT_CURRENCY;

  async function handleClick() {
    setError(null);
    const exchangeRate = Number(rate);
    if (needsRate && !(exchangeRate > 0)) {
      setError("أدخل سعر الصرف");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/system/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(needsRate ? { quoteId, exchangeRate } : { quoteId })
    });
    setLoading(false);

    if (!res.ok) {
      setError("تعذر التحويل");
      return;
    }

    const invoice = await res.json();
    router.push(`/system/invoices/${invoice.id}`);
  }

  return (
    <div className="flex items-center gap-2">
      {needsRate && (
        <input
          className="input w-28 py-1 text-xs"
          type="number"
          min="0"
          step="any"
          dir="ltr"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          placeholder={`${currency} لكل 1 ${DEFAULT_CURRENCY}`}
          aria-label="سعر الصرف"
        />
      )}
      <button onClick={handleClick} disabled={loading} className="btn-secondary py-1.5 px-3 text-xs">
        {loading ? "..." : "تحويل لفاتورة"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
