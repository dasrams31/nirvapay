export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto text-slate-800">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
          Dokumentasi Integrasi REST API & Webhook
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Panduan integrasi cepat NirvaPay Gateway untuk Bot Telegram, Aplikasi Web, dan Backend Microservices
        </p>
      </div>

      <div className="space-y-6">
        {/* Endpoint 1: Create Invoice */}
        <div className="card-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-800 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
              POST
            </span>
            <code className="text-xs font-mono font-bold text-slate-900">/api/v1/invoices</code>
            <span className="badge-purple text-[10px] ml-auto">Membuat Tagihan QRIS</span>
          </div>

          <p className="text-xs text-slate-600">
            Digunakan untuk membuat transaksi baru dan mengenerate gambar QRIS dinamis berstandar EMVCo.
          </p>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Header Wajib:</div>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono overflow-x-auto">
              {`x-api-key: pub_live_xxxxxx
Content-Type: application/json`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contoh Request Body JSON:</div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {`{
  "amount": 50000,
  "customer_name": "Budi Santoso",
  "customer_email": "budi@gmail.com",
  "customer_phone": "08123456789",
  "payment_channel": "GOPAY",
  "callback_url": "https://api.domainanda.com/webhook"
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contoh Response JSON:</div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {`{
  "success": true,
  "data": {
    "id": "INV-893120-X8Z9",
    "invoice_number": "INV-893120-X8Z9",
    "amount": 50000,
    "unique_code": 321,
    "total_amount": 50321,
    "payment_url": "https://nirvapay.dasrams.biz.id/pay/INV-893120-X8Z9",
    "qr_image_url": "https://nirvapay.dasrams.biz.id/api/v1/invoices/INV-893120-X8Z9/qr",
    "status": "PENDING"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Endpoint 2: Check Status */}
        <div className="card-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-800 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
              GET
            </span>
            <code className="text-xs font-mono font-bold text-slate-900">/api/v1/invoices/:id/status</code>
            <span className="badge-purple text-[10px] ml-auto">Polling Status Transaksi</span>
          </div>

          <p className="text-xs text-slate-600">
            Mengecek apakah pelanggan sudah membayar tagihan QRIS secara real-time.
          </p>

          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            {`curl -X GET "https://nirvapay.dasrams.biz.id/api/v1/invoices/INV-893120-X8Z9/status"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
