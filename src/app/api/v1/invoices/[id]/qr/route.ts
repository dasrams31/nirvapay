import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateQrPngBuffer, makeDynamicQris } from "@/lib/qris";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [invoice] = await sql`
      SELECT id, qris_payload, total_amount
      FROM payment_invoices
      WHERE id = ${id} OR invoice_number = ${id}
      LIMIT 1;
    `;

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payload = invoice.qris_payload || makeDynamicQris(Number(invoice.total_amount));
    const qrBuffer = await generateQrPngBuffer(payload);

    return new Response(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
