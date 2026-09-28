import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const dailyRows = await sql`
      SELECT date, total_volume, total_transactions, successful_transactions, failed_transactions, avg_order_value
      FROM daily_analytics
      WHERE merchant_id = ${merchant.merchantId}
      ORDER BY date ASC
    `;

    const channelStats = await sql`
      SELECT payment_channel, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as volume
      FROM payment_invoices
      WHERE merchant_id = ${merchant.merchantId} AND status = 'PAID'
      GROUP BY payment_channel
    `;

    return NextResponse.json({
      success: true,
      daily: dailyRows,
      channels: channelStats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
