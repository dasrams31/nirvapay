import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [invoice] = await sql`
      SELECT id, invoice_number, merchant_id, customer_name, customer_email, customer_phone,
             amount, unique_code, total_amount, payment_channel, qris_payload, status,
             paid_at, expired_at, callback_url, redirect_url, description, metadata, created_at
      FROM payment_invoices
      WHERE id = ${id} OR invoice_number = ${id}
      LIMIT 1;
    `;

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    const baseUrl = process.env.BASE_URL || "https://nirvapay.dasrams.biz.id";

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        payment_url: `${baseUrl}/pay/${invoice.id}`,
        qr_image_url: `${baseUrl}/api/v1/invoices/${invoice.id}/qr`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
