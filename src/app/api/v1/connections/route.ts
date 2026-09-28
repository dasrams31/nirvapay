import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

const connectionSchema = z.object({
  channel: z.string().default("GOPAY"),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
  static_qris: z.string().optional(),
  webhook_secret: z.string().optional(),
  auto_confirm: z.boolean().default(true),
});

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const connections = await sql`
      SELECT id, channel, account_number, account_name, static_qris, webhook_secret, is_active, auto_confirm, updated_at
      FROM merchant_connections
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY id ASC;
    `;

    return NextResponse.json({ success: true, connections });
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
    const data = connectionSchema.parse(body);

    const [existing] = await sql`
      SELECT id FROM merchant_connections
      WHERE merchant_id = ${merchant.merchantId} AND channel = ${data.channel}
      LIMIT 1;
    `;

    if (existing) {
      await sql`
        UPDATE merchant_connections
        SET account_number = ${data.account_number || null},
            account_name = ${data.account_name || null},
            static_qris = ${data.static_qris || null},
            webhook_secret = ${data.webhook_secret || null},
            auto_confirm = ${data.auto_confirm},
            updated_at = NOW()
        WHERE id = ${existing.id};
      `;
    } else {
      await sql`
        INSERT INTO merchant_connections (
          merchant_id, channel, account_number, account_name, static_qris, webhook_secret, is_active, auto_confirm
        ) VALUES (
          ${merchant.merchantId}, ${data.channel}, ${data.account_number || null}, ${data.account_name || null},
          ${data.static_qris || null}, ${data.webhook_secret || null}, TRUE, ${data.auto_confirm}
        );
      `;
    }

    return NextResponse.json({ success: true, message: "Koneksi pembayaran berhasil disimpan" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
