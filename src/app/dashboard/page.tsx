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

  const recentInvoices = await sql`
    SELECT id, invoice_number, customer_name, total_amount, payment_channel, status, created_at, paid_at
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const [merchantDetail] = await sql`
    SELECT balance, qris_static_string, qris_nmid
    FROM merchants
    WHERE id = ${merchant.merchantId}
  `;

  const totalVolume = Number(stats?.total_volume || 0);
  const currentBalance = Number(merchantDetail?.balance || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-white p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Tersedia</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            Rp {currentBalance.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up"></i> Siap ditarik kapan saja
          </div>
        </div>

        <div className="card-white p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            Rp {totalVolume.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">
            {stats?.paid_count || 0} transaksi berhasil
          </div>
        </div>

        <div className="card-white p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Pembayaran</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {stats?.pending_count || 0}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">Menunggu transfer pelanggan</div>
        </div>

        <div className="card-white p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Status Integrasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">AKTIF</div>
          <div className="text-[11px] text-slate-500 font-semibold">Webhook & Polling siap</div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="card-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Transaksi Terbaru</h2>
            <p className="text-xs text-slate-500">Riwayat 5 transaksi QRIS terakhir Anda</p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1"
          >
            Lihat Semua <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </Link>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">No. Invoice</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Saluran</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada transaksi invoice dibuat.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="p-3.5 text-slate-700">{inv.customer_name || "Tamu"}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      Rp {Number(inv.total_amount).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5">
                      <span className="badge-purple text-[10px]">{inv.payment_channel}</span>
                    </td>
                    <td className="p-3.5">
                      {inv.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-emerald-200">
                          <i className="fa-solid fa-circle-check text-[10px]"></i> SUKSES
                        </span>
                      ) : inv.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-yellow-200">
                          <i className="fa-solid fa-clock text-[10px]"></i> PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold text-[11px] border border-rose-200">
                          <i className="fa-solid fa-circle-xmark text-[10px]"></i> EXPIRED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(inv.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/pay/${inv.id}`}
                        target="_blank"
                        className="text-purple-800 hover:text-purple-950 font-bold"
                      >
                        Buka QR <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
