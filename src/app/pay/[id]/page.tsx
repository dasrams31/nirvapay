import { notFound } from "next/navigation";
import sql from "@/lib/db";
import { generateQrPngDataUrl, makeDynamicQris } from "@/lib/qris";
import PayStatusChecker from "./pay-status-checker";

export const dynamic = "force-dynamic";

export default async function PayInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [invoice] = await sql`
    SELECT 
      i.id, i.invoice_number, i.amount, i.unique_code, i.total_amount, i.payment_channel,
      i.status, i.expired_at, i.created_at, i.callback_url,
      m.name as merchant_name, m.qris_static_string, m.qris_nmid
    FROM payment_invoices i
    JOIN merchants m ON i.merchant_id = m.id
    WHERE i.id = ${id}
  `;

  if (!invoice) {
    notFound();
  }

  let qrDataUrl = "";
  if (invoice.qris_static_string) {
    const dynamicString = makeDynamicQris(invoice.qris_static_string, invoice.total_amount);
    qrDataUrl = await generateQrPngDataUrl(dynamicString);
  }

  const isExpired = new Date(invoice.expired_at) < new Date() && invoice.status === "PENDING";
  const status = isExpired ? "EXPIRED" : invoice.status;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex items-center justify-center">
      <div className="card-white max-w-md w-full p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center font-black text-lg">
              N
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">{invoice.merchant_name}</div>
              <div className="text-[11px] text-slate-500 font-mono">#{invoice.invoice_number}</div>
            </div>
          </div>
          <span className="badge-purple">{invoice.payment_channel}</span>
        </div>

        {/* Bill Amount */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</div>
          <div className="text-3xl font-black text-slate-950 font-mono">
            Rp {Number(invoice.total_amount).toLocaleString("id-ID")}
          </div>
          {Number(invoice.unique_code) > 0 && (
            <div className="text-[11px] text-purple-800 font-semibold">
              (Termasuk kode unik verifikasi: +{invoice.unique_code})
            </div>
          )}
        </div>

        {/* QR Section or Success/Expired */}
        {status === "PAID" ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="font-extrabold text-emerald-950 text-base">Pembayaran Berhasil!</div>
            <p className="text-xs text-emerald-800">
              Terima kasih, pembayaran Anda telah diverifikasi otomatis oleh sistem.
            </p>
          </div>
        ) : status === "EXPIRED" ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto text-xl">
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div className="font-extrabold text-rose-950 text-base">Invoice Kedaluwarsa</div>
            <p className="text-xs text-rose-800">
              Batas waktu pembayaran untuk transaksi ini telah habis.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            {qrDataUrl && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-sm">
                <img
                  src={qrDataUrl}
                  alt="QRIS Dinamis"
                  className="w-56 h-56 mx-auto object-contain"
                />
              </div>
            )}
            <div className="text-xs text-slate-500 font-medium">
              Scan menggunakan <strong>GoPay, BCA, Mandiri, DANA, OVO, ShopeePay</strong> atau aplikasi perbankan apa saja.
            </div>
          </div>
        )}

        {/* Live Status Checker Client Component */}
        <PayStatusChecker invoiceId={invoice.id} redirectUrl={invoice.callback_url} />

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-4">
          Secured by <strong>NirvaPay SaaS Gateway</strong>
        </div>
      </div>
    </div>
  );
}
