import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { dispatchWebhook, sendTelegramNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const data = JSON.parse(rawBody);

    const invoiceId = data.nomor_pembayaran || data.id || data.invoice_id;
    const amount = parseFloat(data.total_transfer || data.nominal || data.amount || "0");

    if (!invoiceId || amount <= 0) {
      return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
    }

    const [invoice] = await sql`
      SELECT id, invoice_number, merchant_id, customer_name, amount, unique_code, total_amount, callback_url, status
      FROM payment_invoices
      WHERE (id = ${invoiceId} OR invoice_number = ${invoiceId} OR total_amount = ${amount}) AND status = 'PENDING'
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (!invoice) {
      return NextResponse.json({ status: "error", message: "Invoice not found or already processed" }, { status: 404 });
    }

    await sql`
      UPDATE payment_invoices
      SET status = 'PAID', paid_at = NOW(), updated_at = NOW()
      WHERE id = ${invoice.id};
    `;

    await sql`
      UPDATE merchants
      SET balance = balance + ${Number(invoice.amount)}, updated_at = NOW()
      WHERE id = ${invoice.merchant_id};
    `;

    await sql`
      INSERT INTO mutations (merchant_id, channel, amount, raw_payload, invoice_id, matched, created_at)
      VALUES (${invoice.merchant_id}, 'BUKAOLSHOP', ${amount}, ${rawBody}::jsonb, ${invoice.id}, TRUE, NOW());
    `;

    await dispatchWebhook(invoice.id, invoice.merchant_id, {
      invoice_id: invoice.id,
      merchant_ref: invoice.invoice_number,
      amount: Number(invoice.amount),
      total_amount: Number(invoice.total_amount),
      status: "PAID",
      paid_at: new Date().toISOString(),
      payment_channel: "BUKAOLSHOP_QRIS",
      callback_url: invoice.callback_url,
    });

    await sendTelegramNotification(
      `💰 <b>NOTIFIKASI PEMBAYARAN BUKAOLSHOP!</b>\n\n` +
      `🧾 <b>Invoice:</b> <code>#${invoice.id}</code>\n` +
      `💵 <b>Nominal:</b> <code>Rp ${amount.toLocaleString("id-ID")}</code>\n` +
      `👤 <b>Customer:</b> ${invoice.customer_name}\n` +
      `✅ <b>Status:</b> LUNAS (Settled Instan)`
    );

    return NextResponse.json({ status: "success", message: "Callback processed successfully" });
  } catch (err: any) {
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
