import Link from "next/link";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) return null;

  const [stats] = await sql`
    SELECT 
      COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0) as total_volume,
      COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
      COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
      COUNT(*) as total_count
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
  `;

  const [mutationStats] = await sql`
    SELECT 
      COALESCE(SUM(amount), 0) as total_mutations_amount,
      COUNT(*) as total_mutations_count
    FROM mutations
    WHERE merchant_id = ${merchant.merchantId}
  `;

  const recentInvoices = await sql`
    SELECT id, invoice_number, customer_name, total_amount, payment_channel, status, created_at, paid_at
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
    LIMIT 6
  `;

  const recentMutations = await sql`
    SELECT id, channel, amount, description, sender_name, created_at
    FROM mutations
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const [merchantDetail] = await sql`
    SELECT balance, qris_static_string, qris_nmid, business_name
    FROM merchants
    WHERE id = ${merchant.merchantId}
  `;

  const totalVolume = Number(stats?.total_volume || 0);
  const currentBalance = Number(merchantDetail?.balance || 0);
  const hasQris = Boolean(merchantDetail?.qris_static_string);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Warning Banner if QRIS Not Set */}
      {!hasQris && (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 card-white rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">QRIS Toko Anda Belum Dikonfigurasi!</h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Masukkan payload string QRIS Statis toko Anda di menu Pengaturan agar sistem dapat menginjeksi nominal otomatis saat membuat invoice.
                </p>
              </div>
            </div>
            <Link href="/dashboard/settings" className="btn-purple text-xs shrink-0">
              Konfigurasi QRIS
            </Link>
          </div>
        </div>
      )}

      {/* Top 4 Metrics Grid (Sesuai Versi Asli) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo */}
        <div className="card-white p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Saldo Terkumpul</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-sm">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            Rp {currentBalance.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <i className="fa-solid fa-circle-check"></i> Siap ditarik kapan saja
          </div>
        </div>

        {/* Card 2: Total Transaksi Sukses */}
        <div className="card-white p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volume Lunas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            Rp {totalVolume.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {stats?.paid_count || 0} invoice terbayar
          </div>
        </div>

        {/* Card 3: Menunggu Pembayaran */}
        <div className="card-white p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Invoice</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-800 flex items-center justify-center text-sm">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.pending_count || 0}
          </div>
          <div className="text-[10px] text-yellow-700 font-medium">Menunggu pembayaran pelanggan</div>
        </div>

        {/* Card 4: Total Mutasi Masuk */}
        <div className="card-white p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Mutasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-sm">
              <i className="fa-solid fa-arrow-down-long"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {mutationStats?.total_mutations_count || 0} Trx
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Rp {Number(mutationStats?.total_mutations_amount || 0).toLocaleString("id-ID")} tertangkap
          </div>
        </div>
      </div>

      {/* Main Tables Row: Left (Recent Invoices), Right (Recent Mutations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Invoices */}
        <div className="lg:col-span-7 card-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tagihan & Invoice Terbaru</h2>
              <p className="text-[11px] text-slate-500">Daftar transaksi invoice yang dibuat untuk pelanggan</p>
            </div>
            <Link
              href="/dashboard/invoices"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              Lihat Semua <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">No. Invoice</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      Belum ada invoice dibuat.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                      <td className="p-3 text-slate-600 font-medium">{inv.customer_name || "Pelanggan"}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Rp {Number(inv.total_amount).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3">
                        {inv.status === "PAID" ? (
                          <span className="badge-purple text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                            Lunas
                          </span>
                        ) : (
                          <span className="badge-gold text-[10px]">Pending</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/pay/${inv.id}`}
                          target="_blank"
                          className="text-purple-700 hover:text-purple-900 font-bold text-xs"
                        >
                          Buka QR
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Mutasi Masuk Real-Time */}
        <div className="lg:col-span-5 card-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mutasi Rekening Masuk</h2>
              <p className="text-[11px] text-slate-500">Log mutasi bank/e-wallet tertangkap</p>
            </div>
            <Link
              href="/dashboard/mutations"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              Semua <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="space-y-3">
            {recentMutations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada data mutasi masuk tercatat.
              </div>
            ) : (
              recentMutations.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-purple-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                      <i className="fa-solid fa-arrow-down"></i>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {m.sender_name || m.description || "Transfer Masuk"}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.channel} · {new Date(m.created_at).toLocaleTimeString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-600 text-xs">
                      +Rp {Number(m.amount).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
