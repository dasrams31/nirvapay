import Link from "next/link";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) return null;

  const invoices = await sql`
    SELECT id, invoice_number, customer_name, customer_email, amount, unique_code, total_amount, payment_channel, status, paid_at, created_at
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
    LIMIT 100;
  `;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Daftar Transaksi & Invoice</h1>
          <p className="mt-1 text-xs text-astro-slate">Kelola dan pantau status seluruh tagihan pembayaran QRIS</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/v1/export/csv"
            className="rounded-xl bg-astro-purple px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-astro-purpleGlow transition-all"
          >
            📥 Ekspor CSV
          </a>
        </div>
      </div>

      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-astro-border text-astro-slate uppercase tracking-wider">
              <tr>
                <th className="pb-3 font-bold">ID Invoice</th>
                <th className="pb-3 font-bold">Ref Toko</th>
                <th className="pb-3 font-bold">Pelanggan</th>
                <th className="pb-3 font-bold">Nominal Pokok</th>
                <th className="pb-3 font-bold">Kode Unik</th>
                <th className="pb-3 font-bold">Total Tagihan</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Waktu Buat</th>
                <th className="pb-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-astro-border/50 text-astro-text">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-astro-slate">
                    Belum ada transaksi invoice.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-astro-dark/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">{inv.id}</td>
                    <td className="py-3.5 font-mono text-astro-slate">{inv.invoice_number}</td>
                    <td className="py-3.5 font-medium">{inv.customer_name || "-"}</td>
                    <td className="py-3.5 font-mono">Rp {Number(inv.amount).toLocaleString("id-ID")}</td>
                    <td className="py-3.5 font-mono text-astro-gold">+{inv.unique_code}</td>
                    <td className="py-3.5 font-bold font-mono text-white">
                      Rp {Number(inv.total_amount).toLocaleString("id-ID")}
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
                        Buka Pay ↗
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
