import Link from "next/link";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) return null;

  const invoices = await sql`
    SELECT id, invoice_number, customer_name, customer_email, amount, unique_code, total_amount, payment_channel, status, created_at, paid_at
    FROM payment_invoices
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Daftar Transaksi & Invoice</h1>
          <p className="text-xs text-slate-500 font-medium">
            Riwayat seluruh transaksi pembayaran QRIS masuk ke merchant Anda
          </p>
        </div>
        <a
          href="/api/v1/export/csv"
          className="btn-purple text-xs flex items-center gap-2 shadow-sm shrink-0"
        >
          <i className="fa-solid fa-file-csv"></i> Unduh Laporan CSV
        </a>
      </div>

      <div className="card-white p-6 space-y-5">
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">No. Invoice</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Nominal Pokok</th>
                <th className="p-3.5">Kode Unik</th>
                <th className="p-3.5">Total Bayar</th>
                <th className="p-3.5">Saluran</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Waktu Dibuat</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Belum ada transaksi invoice ditemukan.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="p-3.5 text-slate-700">
                      <div className="font-bold">{inv.customer_name || "Tamu"}</div>
                      <div className="text-[10px] text-slate-400">{inv.customer_email || "-"}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      Rp {Number(inv.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 font-mono text-purple-800 font-bold">+{inv.unique_code}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-950">
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
                        Buka Tagihan <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
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
