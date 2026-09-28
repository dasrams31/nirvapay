import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { dispatchWebhook, sendTelegramNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let data: any = {};
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { raw_text: rawBody };
    }

    let amount = 0;
    if (data.amount) {
      amount = parseFloat(data.amount);
    } else if (data.nominal) {
      amount = parseFloat(data.nominal);
    }

    if (amount <= 0) {
      return NextResponse.json({ success: true, message: "Ignored (no amount)" });
    }

    const [invoice] = await sql`
      SELECT id, invoice_number, merchant_id, customer_name, amount, unique_code, total_amount, callback_url, status
      FROM payment_invoices
      WHERE (total_amount = ${amount} OR amount = ${amount}) AND status = 'PENDING' AND expired_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (invoice) {
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
        VALUES (${invoice.merchant_id}, 'DANA', ${amount}, ${rawBody}::jsonb, ${invoice.id}, TRUE, NOW());
      `;

      await dispatchWebhook(invoice.id, invoice.merchant_id, {
        invoice_id: invoice.id,
        merchant_ref: invoice.invoice_number,
        amount: Number(invoice.amount),
        total_amount: Number(invoice.total_amount),
        status: "PAID",
        paid_at: new Date().toISOString(),
        payment_channel: "DANA_QRIS",
        callback_url: invoice.callback_url,
      });

      await sendTelegramNotification(
        `💰 <b>NOTIFIKASI PEMBAYARAN DANA QRIS!</b>\n\n` +
        `🧾 <b>Invoice:</b> <code>#${invoice.id}</code>\n` +
        `💵 <b>Nominal:</b> <code>Rp ${amount.toLocaleString("id-ID")}</code>\n` +
        `👤 <b>Customer:</b> ${invoice.customer_name}\n` +
        `✅ <b>Status:</b> LUNAS (Settled Instan)`
      );

      return NextResponse.json({ success: true, matched: true, invoice_id: invoice.id });
    }

    return NextResponse.json({ success: true, matched: false });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
