import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [invoice] = await sql`
      SELECT id, invoice_number, amount, unique_code, total_amount, status, paid_at, expired_at
      FROM payment_invoices
      WHERE id = ${id} OR invoice_number = ${id}
      LIMIT 1;
    `;

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    // Auto-expire check
    if (invoice.status === "PENDING" && invoice.expired_at && new Date(invoice.expired_at) < new Date()) {
      await sql`UPDATE payment_invoices SET status = 'EXPIRED', updated_at = NOW() WHERE id = ${invoice.id}`;
      invoice.status = "EXPIRED";
    }

    return NextResponse.json({
      success: true,
      status: invoice.status,
      invoice_id: invoice.id,
      amount: Number(invoice.amount),
      total_amount: Number(invoice.total_amount),
      paid_at: invoice.paid_at,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
