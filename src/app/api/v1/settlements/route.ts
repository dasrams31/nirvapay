import { NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

const withdrawalSchema = z.object({
  amount: z.coerce.number().int().min(10000, "Minimal penarikan saldo adalah Rp 10.000"),
  bank_name: z.string().min(2),
  account_number: z.string().min(4),
  account_name: z.string().min(2),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const settlements = await sql`
      SELECT id, settlement_id, amount, fee, net_amount, bank_name, account_number, account_name, status, notes, created_at, processed_at
      FROM settlements
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY created_at DESC
    `;

    const [merchantRow] = await sql`
      SELECT balance FROM merchants WHERE id = ${merchant.merchantId}
    `;

    return NextResponse.json({
      success: true,
      balance: Number(merchantRow?.balance || 0),
      settlements,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = withdrawalSchema.parse(body);

    const [merchantRow] = await sql`
      SELECT balance FROM merchants WHERE id = ${merchant.merchantId}
    `;

    const currentBalance = Number(merchantRow?.balance || 0);
    if (currentBalance < data.amount) {
      return NextResponse.json({ success: false, message: "Saldo tidak mencukupi untuk penarikan ini" }, { status: 400 });
    }

    const fee = 0; // 0% withdrawal fee
    const netAmount = data.amount - fee;
    const settlementId = `STL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Atomic transaction: deduct balance and create settlement request
    await sql.begin(async (tx) => {
      await tx`
        UPDATE merchants
        SET balance = balance - ${data.amount}
        WHERE id = ${merchant.merchantId}
      `;

      await tx`
        INSERT INTO settlements (
          settlement_id, merchant_id, amount, fee, net_amount,
          bank_name, account_number, account_name, status, notes, created_at
        ) VALUES (
          ${settlementId}, ${merchant.merchantId}, ${data.amount}, ${fee}, ${netAmount},
          ${data.bank_name}, ${data.account_number}, ${data.account_name}, 'PENDING', ${data.notes || null}, NOW()
        )
      `;
    });

    return NextResponse.json({
      success: true,
      message: "Permintaan penarikan saldo berhasil dibuat dan segera diproses",
      settlement_id: settlementId,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
