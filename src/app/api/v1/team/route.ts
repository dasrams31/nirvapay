import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

const memberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "developer", "finance", "operator"]),
});

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const members = await sql`
      SELECT id, name, email, role, status, created_at
      FROM team_members
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, members });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = memberSchema.parse(body);

    const [member] = await sql`
      INSERT INTO team_members (merchant_id, name, email, role, status)
      VALUES (${merchant.merchantId}, ${data.name}, ${data.email.toLowerCase()}, ${data.role}, 'active')
      RETURNING id, name, email, role, status, created_at
    `;

    return NextResponse.json({
      success: true,
      message: "Anggota tim berhasil ditambahkan",
      member,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
