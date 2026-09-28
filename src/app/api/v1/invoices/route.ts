import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { authenticateApiKey, getCurrentMerchant } from "@/lib/auth";
import { makeDynamicQris } from "@/lib/qris";
import { sendTelegramNotification } from "@/lib/notifications";

const createInvoiceSchema = z.object({
  amount: z.coerce.number().positive(),
  merchant_ref: z.string().optional(),
  customer_name: z.string().default("Pelanggan"),
  customer_email: z.string().optional(),
  customer_phone: z.string().optional(),
  description: z.string().optional(),
  payment_channel: z.string().default("QRIS"),
  callback_url: z.string().url().optional().or(z.literal("")),
  redirect_url: z.string().url().optional().or(z.literal("")),
  use_unique_code: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const authHdr = req.headers.get("Authorization");
    let merchant = await authenticateApiKey(authHdr);

    if (!merchant) {
      const sessionMerchant = await getCurrentMerchant();
      if (sessionMerchant) {
        merchant = {
          merchantId: sessionMerchant.merchantId,
          keyName: "Session Dashboard",
          merchantName: sessionMerchant.name,
          email: sessionMerchant.email,
        };
      }
    }

    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized (API Key / Session Required)" }, { status: 401 });
    }

    const body = await req.json();
    const data = createInvoiceSchema.parse(body);

    const now = new Date();
    const timestampStr = now.toISOString().slice(0, 10).replace(/-/g, "") + Math.floor(now.getTime() / 1000).toString().slice(-4);
    const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceId = `INV-${timestampStr}-${randHex}`;
    const invoiceNumber = data.merchant_ref || invoiceId;

    // Calculate unique amount code if requested
    let uniqueCode = 0;
    if (data.use_unique_code) {
      // Find collision-free unique code 1-499
      const pendingCodes = await sql`
        SELECT unique_code FROM payment_invoices
        WHERE merchant_id = ${merchant.merchantId} AND status = 'PENDING' AND expired_at > NOW();
      `;
      const usedSet = new Set(pendingCodes.map((r) => r.unique_code));
      for (let attempt = 0; attempt < 30; attempt++) {
        const code = Math.floor(Math.random() * 499) + 1;
        if (!usedSet.has(code)) {
          uniqueCode = code;
          break;
        }
      }
    }

    const totalAmount = data.amount + uniqueCode;
    const expiredAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins

    // Get merchant custom static QRIS if configured
    const [conn] = await sql`
      SELECT static_qris FROM merchant_connections
      WHERE merchant_id = ${merchant.merchantId} AND is_active = TRUE AND static_qris IS NOT NULL
      LIMIT 1;
    `;

    const qrisPayload = makeDynamicQris(totalAmount, conn?.static_qris);
    const baseUrl = process.env.BASE_URL || "https://nirvapay.dasrams.biz.id";
    const paymentUrl = `${baseUrl}/pay/${invoiceId}`;

    const metaJson = JSON.stringify(data.metadata || {});
    await sql`
      INSERT INTO payment_invoices (
        id, invoice_number, merchant_id, customer_name, customer_email, customer_phone,
        amount, unique_code, total_amount, payment_channel, qris_payload, status,
        expired_at, callback_url, redirect_url, description, metadata, created_at, updated_at
      ) VALUES (
        ${invoiceId}, ${invoiceNumber}, ${merchant.merchantId}, ${data.customer_name}, ${data.customer_email || null}, ${data.customer_phone || null},
        ${data.amount}, ${uniqueCode}, ${totalAmount}, ${data.payment_channel}, ${qrisPayload}, 'PENDING',
        ${expiredAt}, ${data.callback_url || null}, ${data.redirect_url || null}, ${data.description || `Pembayaran #${invoiceNumber}`},
        ${metaJson}::jsonb, NOW(), NOW()
      );
    `;

    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoice: {
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        amount: data.amount,
        unique_code: uniqueCode,
        total_amount: totalAmount,
        payment_channel: data.payment_channel,
        qris_payload: qrisPayload,
        payment_url: paymentUrl,
        qr_image_url: `${baseUrl}/api/v1/invoices/${invoiceId}/qr`,
        status: "PENDING",
        expired_at: expiredAt.toISOString(),
        created_at: now.toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Bad Request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const authHdr = req.headers.get("Authorization");
    let merchant = await authenticateApiKey(authHdr);

    if (!merchant) {
      const sessionMerchant = await getCurrentMerchant();
      if (sessionMerchant) {
        merchant = {
          merchantId: sessionMerchant.merchantId,
          keyName: "Session Dashboard",
          merchantName: sessionMerchant.name,
          email: sessionMerchant.email,
        };
      }
    }

    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
    const status = searchParams.get("status")?.toUpperCase();

    const invoices = status
      ? await sql`
          SELECT id, invoice_number, customer_name, amount, unique_code, total_amount, payment_channel, status, paid_at, expired_at, created_at
          FROM payment_invoices
          WHERE merchant_id = ${merchant.merchantId} AND status = ${status}
          ORDER BY created_at DESC
          LIMIT ${limit};
        `
      : await sql`
          SELECT id, invoice_number, customer_name, amount, unique_code, total_amount, payment_channel, status, paid_at, expired_at, created_at
          FROM payment_invoices
          WHERE merchant_id = ${merchant.merchantId}
          ORDER BY created_at DESC
          LIMIT ${limit};
        `;

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
