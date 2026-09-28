export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto text-astro-text">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Dokumentasi API NirvaPay</h1>
        <p className="mt-1 text-xs md:text-sm text-astro-slate">
          Panduan integrasi REST API Payment Gateway QRIS Dinamis NirvaPay
        </p>
      </div>

      {/* Base URL */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Base URL Server API</h2>
        <div className="rounded-xl border border-astro-border bg-astro-dark p-3 font-mono text-xs text-astro-cyan">
          https://nirvapay.dasrams.biz.id/api/v1
        </div>
        <p className="text-xs text-astro-slate leading-relaxed">
          Gunakan header otentikasi <code className="text-astro-purpleGlow">Authorization: Bearer sec_live_xxx</code> pada setiap permintaan API.
        </p>
      </div>

      {/* Create Invoice */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
            POST
          </span>
          <span className="font-mono text-sm font-bold text-white">/invoices</span>
        </div>
        <p className="text-xs text-astro-slate">Membuat transaksi pembayaran QRIS Dinamis baru.</p>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Contoh Request Body (JSON)</span>
          <pre className="rounded-2xl border border-astro-border bg-astro-dark p-4 font-mono text-xs text-astro-slate overflow-x-auto leading-relaxed">
{`{
  "amount": 50000,
  "merchant_ref": "ORDER-1001",
  "customer_name": "Rama Danadipa",
  "customer_email": "buyer@email.com",
  "description": "Pembayaran Akun Premium #1001",
  "callback_url": "https://yourapp.com/api/webhooks/nirvapay",
  "use_unique_code": true
}`}
          </pre>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Contoh Response (200 OK)</span>
          <pre className="rounded-2xl border border-astro-border bg-astro-dark p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "invoice_id": "INV-20260928-A1B2",
    "invoice_number": "ORDER-1001",
    "amount": 50000,
    "unique_code": 142,
    "total_amount": 50142,
    "qris_payload": "00020101021226610014COM.GO-JEK.WWW...",
    "payment_url": "https://nirvapay.dasrams.biz.id/pay/INV-20260928-A1B2",
    "qr_image_url": "https://nirvapay.dasrams.biz.id/api/v1/invoices/INV-20260928-A1B2/qr",
    "status": "PENDING",
    "expired_at": "2026-09-28T10:30:00.000Z"
  }
}`}
          </pre>
        </div>
      </div>

      {/* Check Status */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-astro-cyan/10 border border-astro-cyan/30 px-2.5 py-0.5 font-mono text-xs font-bold text-astro-cyan">
            GET
          </span>
          <span className="font-mono text-sm font-bold text-white">/invoices/:invoice_id/status</span>
        </div>
        <p className="text-xs text-astro-slate">Mengecek status pembayaran invoice secara real-time.</p>

        <pre className="rounded-2xl border border-astro-border bg-astro-dark p-4 font-mono text-xs text-astro-slate overflow-x-auto leading-relaxed">
{`// Response
{
  "success": true,
  "status": "PAID",
  "invoice_id": "INV-20260928-A1B2",
  "amount": 50000,
  "total_amount": 50142,
  "paid_at": "2026-09-28T10:18:24.000Z"
}`}
        </pre>
      </div>
    </div>
  );
}
