import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

const settingsSchema = z.object({
  name: z.string().min(2),
  business_name: z.string().optional(),
  phone: z.string().optional(),
  qris_static_string: z.string().optional(),
  qris_nmid: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    await sql`
      UPDATE merchants
      SET name = ${data.name},
          business_name = ${data.business_name || data.name},
          phone = ${data.phone || null},
          qris_static_string = ${data.qris_static_string || null},
          qris_nmid = ${data.qris_nmid || null},
          updated_at = NOW()
      WHERE id = ${merchant.merchantId}
    `;

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
