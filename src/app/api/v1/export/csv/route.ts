import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const records = await sql`
      SELECT id, invoice_number, customer_name, customer_email, amount, unique_code, total_amount, payment_channel, status, paid_at, created_at
      FROM payment_invoices
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC
      LIMIT 1000;
    `;

    const headers = [
      "No. Invoice",
      "Nomor Referensi",
      "Nama Pelanggan",
      "Email",
      "Nominal (Rp)",
      "Kode Unik",
      "Total Tagihan (Rp)",
      "Metode",
      "Status",
      "Waktu Dibuat",
      "Waktu Lunas",
    ];

    const rows = records.map((r) => [
      r.id,
      r.invoice_number,
      `"${(r.customer_name || "").replace(/"/g, '""')}"`,
      r.customer_email || "-",
      Number(r.amount).toFixed(2),
      r.unique_code,
      Number(r.total_amount).toFixed(2),
      r.payment_channel,
      r.status,
      r.created_at ? new Date(r.created_at).toLocaleString("id-ID") : "-",
      r.paid_at ? new Date(r.paid_at).toLocaleString("id-ID") : "-",
    ]);

    const csvContent = "\ufeff" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
    const filename = `NirvaPay_Report_${merchant.merchantId}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
