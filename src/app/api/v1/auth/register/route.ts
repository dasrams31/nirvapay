import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { createJwtToken, hashPassword, SESSION_COOKIE } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  business_name: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const [existing] = await sql`
      SELECT id FROM merchants WHERE email = ${data.email.toLowerCase()} LIMIT 1;
    `;

    if (existing) {
      return NextResponse.json({ success: false, message: "Email sudah terdaftar" }, { status: 400 });
    }

    const passwordHash = hashPassword(data.password);
    const [merchant] = await sql`
      INSERT INTO merchants (name, email, password_hash, business_name, phone, status)
      VALUES (${data.name}, ${data.email.toLowerCase()}, ${passwordHash}, ${data.business_name || data.name}, ${data.phone || null}, 'active')
      RETURNING id, name, email, business_name;
    `;

    // Generate Default Live API Key & Secret
    const randPub = Math.random().toString(36).substring(2, 10);
    const randSec = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const publicKey = `pub_live_${randPub}_${merchant.id}`;
    const secretKey = `sec_live_${randSec}_${merchant.id}`;

    await sql`
      INSERT INTO api_keys (merchant_id, name, public_key, secret_key, is_active)
      VALUES (${merchant.id}, 'Default Live API Key', ${publicKey}, ${secretKey}, TRUE);
    `;

    const token = createJwtToken({ merchantId: merchant.id, email: merchant.email });
    const response = NextResponse.json({
      success: true,
      message: "Registrasi merchant berhasil",
      merchant: { id: merchant.id, name: merchant.name, email: merchant.email },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Invalid input" }, { status: 400 });
  }
}
