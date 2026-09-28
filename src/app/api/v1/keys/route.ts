import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const keys = await sql`
      SELECT id, name, public_key, secret_key, is_active, created_at, last_used_at
      FROM api_keys
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ success: true, keys });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const randPub = Math.random().toString(36).substring(2, 10);
    const randSec = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const publicKey = `pub_live_${randPub}_${merchant.merchantId}`;
    const secretKey = `sec_live_${randSec}_${merchant.merchantId}`;

    const [newKey] = await sql`
      INSERT INTO api_keys (merchant_id, name, public_key, secret_key, is_active)
      VALUES (${merchant.merchantId}, 'Regenerated Live Key', ${publicKey}, ${secretKey}, TRUE)
      RETURNING id, name, public_key, secret_key, is_active, created_at;
    `;

    return NextResponse.json({
      success: true,
      message: "API Keys regenerated successfully",
      key: newKey,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
