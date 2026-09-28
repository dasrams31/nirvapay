import Link from "next/link";
import sql from "@/lib/db";
import { getCurrentMerchant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MutationsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) return null;

  const mutations = await sql`
    SELECT id, channel, amount, description, sender_name, created_at
    FROM mutations
    WHERE merchant_id = ${merchant.merchantId}
    ORDER BY created_at DESC
  `;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Log Mutasi Rekening Masuk</h1>
          <p className="text-xs text-slate-500 font-medium">
            Riwayat penerimaan dana dari GoPay Merchant, DANA Bisnis, KlikQRIS, atau Bank Transfer
          </p>
        </div>
      </div>

      <div className="card-white p-6 space-y-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID Mutasi</th>
                <th className="p-3.5">Saluran</th>
                <th className="p-3.5">Pengirim / Keterangan</th>
                <th className="p-3.5">Nominal Masuk</th>
                <th className="p-3.5">Waktu Penerimaan</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mutations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada riwayat mutasi masuk tercatat.
                  </td>
                </tr>
              ) : (
                mutations.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-slate-500">#{m.id}</td>
                    <td className="p-3.5">
                      <span className="badge-purple text-[10px]">{m.channel}</span>
                    </td>
                    <td className="p-3.5 text-slate-800">
                      <div className="font-bold">{m.sender_name || "Transfer QRIS Masuk"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.description || "-"}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      +Rp {Number(m.amount).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(m.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                        <i className="fa-solid fa-check"></i> Tertangkap
                      </span>
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
