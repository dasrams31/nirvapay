import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

const webhookSchema = z.object({
  url: z.string().url(),
});

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const endpoints = await sql`
      SELECT id, url, secret_key, is_active, created_at
      FROM webhook_endpoints
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC;
    `;

    const logs = await sql`
      SELECT id, invoice_id, endpoint_url, response_status, success, created_at
      FROM webhook_logs
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    return NextResponse.json({ success: true, endpoints, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = webhookSchema.parse(body);
    const secretKey = `whsec_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

    const [endpoint] = await sql`
      INSERT INTO webhook_endpoints (merchant_id, url, secret_key, is_active)
      VALUES (${merchant.merchantId}, ${data.url}, ${secretKey}, TRUE)
      RETURNING id, url, secret_key, is_active, created_at;
    `;

    return NextResponse.json({ success: true, message: "Webhook endpoint registered", endpoint });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
