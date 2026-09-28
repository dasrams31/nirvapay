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
    WHERE merchant_id = ${merchant.merchantId};
  `;

  const [merchantRow] = await sql`
    SELECT balance FROM merchants WHERE id = ${merchant.merchantId};
  `;

  const recentInvoices = await sql`
    SELECT id, invoice_number, customer_name, amount, unique_code, total_amount, payment_channel, status, paid_at, created_at
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
    LIMIT 8;
  `;

  const [apiKey] = await sql`
    SELECT public_key, secret_key FROM api_keys WHERE merchant_id = ${merchant.merchantId} AND is_active = TRUE LIMIT 1;
  `;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang, {merchant.name}!
          </h1>
          <p className="mt-1 text-xs md:text-sm text-astro-slate">
            Ringkasan lalu lintas pembayaran QRIS dan performa transaksi toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invoices"
            className="rounded-xl border border-astro-border bg-astro-card px-4 py-2.5 text-xs font-semibold text-astro-slate hover:bg-astro-cardHover hover:text-white transition-all"
          >
            Semua Invoice
          </Link>
          <a
            href="/api/v1/export/csv"
            className="rounded-xl bg-astro-purple px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-astro-purpleGlow transition-all flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Ekspor Laporan (CSV)</span>
          </a>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="astro-card rounded-2xl p-5 shadow-soft space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Total Volume Lunas</span>
          <p className="text-2xl font-extrabold text-white tabular-nums">
            Rp {Number(stats?.total_volume || 0).toLocaleString("id-ID")}
          </p>
          <span className="block text-[11px] text-astro-emerald">✓ Dari {stats?.paid_count || 0} transaksi berhasil</span>
        </div>

        <div className="astro-card rounded-2xl p-5 shadow-soft space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Saldo Dompet Tersedia</span>
          <p className="text-2xl font-extrabold text-astro-purpleGlow tabular-nums">
            Rp {Number(merchantRow?.balance || 0).toLocaleString("id-ID")}
          </p>
          <span className="block text-[11px] text-astro-slate">Siap ditarik ke rekening</span>
        </div>

        <div className="astro-card rounded-2xl p-5 shadow-soft space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Invoice Pending</span>
          <p className="text-2xl font-extrabold text-astro-gold tabular-nums">
            {stats?.pending_count || 0}
          </p>
          <span className="block text-[11px] text-astro-slate">Menunggu pembayaran pelanggan</span>
        </div>

        <div className="astro-card rounded-2xl p-5 shadow-soft space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-astro-slate">Total Semua Tagihan</span>
          <p className="text-2xl font-extrabold text-white tabular-nums">
            {stats?.total_count || 0}
          </p>
          <span className="block text-[11px] text-astro-slate">Akumulasi seluruh waktu</span>
        </div>
      </div>

      {/* API Key Fast Snippet */}
      {apiKey && (
        <div className="rounded-2xl border border-astro-purple/20 bg-astro-purple/5 p-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-astro-purpleGlow uppercase tracking-wider">Kredensial API Live Aktif</span>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-white">
              <span>Public: <b className="text-astro-cyan">{apiKey.public_key}</b></span>
              <span>·</span>
              <span>Secret: <b className="text-astro-slate">{apiKey.secret_key.slice(0, 10)}••••••••••</b></span>
            </div>
          </div>
          <Link
            href="/dashboard/keys"
            className="w-fit rounded-xl border border-astro-purple/30 bg-astro-purple/10 px-3.5 py-1.5 text-xs font-bold text-astro-purpleGlow hover:bg-astro-purple hover:text-white transition-all"
          >
            Kelola Kunci API →
          </Link>
        </div>
      )}

      {/* Recent Invoices Table */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Transaksi Terakhir</h2>
          <Link href="/dashboard/invoices" className="text-xs font-semibold text-astro-purpleGlow hover:underline">
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-astro-border text-astro-slate uppercase tracking-wider">
              <tr>
                <th className="pb-3 font-bold">No. Invoice</th>
                <th className="pb-3 font-bold">Pelanggan</th>
                <th className="pb-3 font-bold">Total Tagihan</th>
                <th className="pb-3 font-bold">Saluran</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Waktu</th>
                <th className="pb-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-astro-border/50 text-astro-text">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-astro-slate">
                    Belum ada transaksi. Gunakan API atau tombol test untuk membuat invoice baru.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-astro-dark/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">{inv.id}</td>
                    <td className="py-3.5 font-medium">{inv.customer_name || "-"}</td>
                    <td className="py-3.5 font-bold font-mono text-white">
                      Rp {Number(inv.total_amount).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded bg-astro-card px-2 py-0.5 font-mono text-[10px] text-astro-cyan border border-astro-border">
                        {inv.payment_channel}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {inv.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          LUNAS
                        </span>
                      ) : inv.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          PENDING
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                          {inv.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-astro-slate">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/pay/${inv.id}`}
                        target="_blank"
                        className="rounded-lg border border-astro-border bg-astro-dark px-2.5 py-1 text-[11px] font-semibold text-astro-slate hover:text-white hover:border-astro-purple transition-all"
                      >
                        Buka QRIS ↗
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
