import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { createJwtToken, verifyPassword, SESSION_COOKIE } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const [merchant] = await sql`
      SELECT id, name, email, password_hash, business_name, status
      FROM merchants
      WHERE email = ${data.email.toLowerCase()}
      LIMIT 1;
    `;

    if (!merchant || !verifyPassword(data.password, merchant.password_hash)) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 });
    }

    if (merchant.status !== "active") {
      return NextResponse.json({ success: false, message: "Akun merchant sedang dinonaktifkan" }, { status: 403 });
    }

    const token = createJwtToken({ merchantId: merchant.id, email: merchant.email });
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      merchant: { id: merchant.id, name: merchant.name, email: merchant.email, business_name: merchant.business_name },
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
