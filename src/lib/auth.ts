import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import sql from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "AeternumNirvaPaySecretKey2026SecureSalt";
export const SESSION_COOKIE = "nirvapay_session";

export interface MerchantSession {
  merchantId: number;
  email: string;
  name: string;
  businessName?: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function createJwtToken(payload: object, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyJwtToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export async function getCurrentMerchant(): Promise<MerchantSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyJwtToken<{ merchantId: number }>(token);
  if (!payload || !payload.merchantId) return null;

  const [merchant] = await sql`
    SELECT id, name, email, business_name, balance, status
    FROM merchants
    WHERE id = ${payload.merchantId} AND status = 'active'
    LIMIT 1;
  `;

  if (!merchant) return null;
  return {
    merchantId: merchant.id,
    email: merchant.email,
    name: merchant.name,
    businessName: merchant.business_name,
  };
}

export async function authenticateApiKey(authHeader?: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const [keyRow] = await sql`
    SELECT a.id, a.merchant_id, a.name, a.public_key, a.secret_key, m.name as merchant_name, m.email, m.status
    FROM api_keys a
    INNER JOIN merchants m ON m.id = a.merchant_id
    WHERE (a.secret_key = ${token} OR a.public_key = ${token}) AND a.is_active = TRUE AND m.status = 'active'
    LIMIT 1;
  `;

  if (!keyRow) return null;

  // Update last used timestamp
  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyRow.id}`;

  return {
    merchantId: keyRow.merchant_id,
    keyName: keyRow.name,
    merchantName: keyRow.merchant_name,
    email: keyRow.email,
  };
}
