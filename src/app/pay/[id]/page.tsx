import { notFound } from "next/navigation";
import sql from "@/lib/db";
import { generateQrPngDataUrl, makeDynamicQris } from "@/lib/qris";
import PayStatusChecker from "./pay-status-checker";

export const dynamic = "force-dynamic";

export default async function CustomerPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [invoice] = await sql`
    SELECT p.id, p.invoice_number, p.customer_name, p.amount, p.unique_code, p.total_amount,
           p.payment_channel, p.qris_payload, p.status, p.paid_at, p.expired_at, p.redirect_url, p.description,
           m.business_name, m.name as merchant_name
    FROM payment_invoices p
    INNER JOIN merchants m ON m.id = p.merchant_id
    WHERE p.id = ${id} OR p.invoice_number = ${id}
    LIMIT 1;
  `;

  if (!invoice) notFound();

  const payload = invoice.qris_payload || makeDynamicQris(Number(invoice.total_amount));
  const qrDataUrl = await generateQrPngDataUrl(payload);

  const isPaid = invoice.status === "PAID";
  const isExpired = invoice.status === "EXPIRED" || (!isPaid && invoice.expired_at && new Date(invoice.expired_at) < new Date());

  return (
    <div className="flex min-h-screen items-center justify-center bg-astro-dark px-4 py-8 md:py-12 astro-mesh text-astro-text selection:bg-astro-purple selection:text-white">
      <div className="w-full max-w-md rounded-3xl border border-astro-border bg-astro-card p-6 md:p-8 shadow-glow space-y-6">
        
        {/* Header Store */}
        <div className="text-center border-b border-astro-border pb-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-purpleGlow">
            {invoice.business_name || invoice.merchant_name}
          </span>
          <h1 className="text-lg font-extrabold text-white">Invoice #{invoice.id}</h1>
          <p className="text-xs text-astro-slate truncate">{invoice.description || "Pembayaran Pesanan"}</p>
        </div>

        {/* Status Badge */}
        {isPaid ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg font-bold text-emerald-400">Pembayaran Berhasil Lunas!</h2>
            <p className="text-xs text-astro-slate">
              Terima kasih, transaksi Anda telah dikonfirmasi oleh server NirvaPay.
            </p>
            {invoice.redirect_url && (
              <a
                href={invoice.redirect_url}
                className="mt-3 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-emerald-400 transition-all"
              >
                Kembali ke Halaman Toko →
              </a>
            )}
          </div>
        ) : isExpired ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center space-y-2">
            <div className="text-4xl">⏰</div>
            <h2 className="text-lg font-bold text-rose-400">Invoice Telah Kedaluwarsa</h2>
            <p className="text-xs text-astro-slate">
              Batas waktu pembayaran telah habis. Silakan buat pesanan baru di toko.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Box */}
            <div className="rounded-2xl border border-astro-border bg-astro-dark p-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-astro-slate uppercase tracking-wider">Total Tagihan Pembayaran</span>
              <p className="text-3xl font-extrabold text-white tabular-nums">
                Rp {Number(invoice.total_amount).toLocaleString("id-ID")}
              </p>
              {invoice.unique_code > 0 && (
                <p className="text-[11px] text-astro-gold">
                  *Termasuk kode unik verifikasi otomatis: <b>+{invoice.unique_code}</b>
                </p>
              )}
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-soft">
              <img
                src={qrDataUrl}
                alt="QRIS NirvaPay"
                className="h-64 w-64 object-contain rounded-lg"
              />
              <span className="mt-2 text-[11px] font-medium text-slate-600">
                Support: GoPay, OVO, DANA, BCA, Livin, ShopeePay
              </span>
            </div>

            {/* Live Polling & Action Controls */}
            <PayStatusChecker invoiceId={invoice.id} redirectUrl={invoice.redirect_url} />

            <div className="rounded-xl border border-astro-border bg-astro-dark/50 p-3.5 text-xs text-astro-slate space-y-1">
              <p className="font-bold text-white">Petunjuk Pembayaran:</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                <li>Buka aplikasi e-wallet atau mobile banking apa saja.</li>
                <li>Scan kode QRIS di atas.</li>
                <li>Pastikan nominal transfer <b>TEPAT Rp {Number(invoice.total_amount).toLocaleString("id-ID")}</b>.</li>
                <li>Selesai! Sistem akan otomatis memverifikasi dalam beberapa detik.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-astro-border pt-4 text-center text-[10px] text-astro-slate">
          Secured by NirvaPay QRIS Engine · PT Aeternum Kreasikan Bersama
        </div>
      </div>
    </div>
  );
}
