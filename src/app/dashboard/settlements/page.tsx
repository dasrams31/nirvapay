"use client";

import { useEffect, useState } from "react";

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/settlements");
      const data = await res.json();
      if (data.success) {
        setSettlements(data.settlements);
        setBalance(data.balance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    setError("");

    try {
      const res = await fetch("/api/v1/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Permintaan penarikan saldo berhasil diajukan!");
        setAmount("");
        fetchData();
      } else {
        setError(data.message || "Gagal mengajukan penarikan");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Penarikan Saldo & Settlement</h1>
          <p className="text-xs text-slate-500 font-medium">
            Tarik saldo pendapatan merchant Anda langsung ke rekening bank atau e-wallet tanpa biaya admin (0% Fee)
          </p>
        </div>
        <div className="card-white px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
            <i className="fa-solid fa-wallet"></i>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Saldo Dapat Ditarik</div>
            <div className="text-lg font-black text-slate-950 font-mono">
              Rp {balance.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Tarik Saldo */}
        <div className="lg:col-span-5 card-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Ajukan Penarikan Dana</h2>
              <p className="text-[11px] text-slate-500">Proses pencairan instan 1x24 jam</p>
            </div>
          </div>

          {msg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600"></i>
              <span>{msg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nominal Penarikan (Rp)</label>
              <input
                type="number"
                required
                min={10000}
                max={balance}
                placeholder="Minimal Rp 10.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Bank / E-Wallet Tujuan</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              >
                <option value="BCA">Bank BCA (Bank Central Asia)</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">Bank BRI</option>
                <option value="BNI">Bank BNI</option>
                <option value="SEABANK">SeaBank Indonesia</option>
                <option value="JAGO">Bank Jago</option>
                <option value="GOPAY">GoPay Wallet</option>
                <option value="DANA">DANA Wallet</option>
                <option value="OVO">OVO Wallet</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nomor Rekening / HP</label>
                <input
                  type="text"
                  required
                  placeholder="8839210291"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-purple-700 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Ramadhana"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Catatan (Opsional)</label>
              <input
                type="text"
                placeholder="Pencairan mingguan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || balance < 10000}
              className="btn-purple w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Mengirim Pengajuan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> Kirim Permintaan Settlement
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Settlement */}
        <div className="lg:col-span-7 card-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Riwayat Penarikan Dana</h2>
              <p className="text-[11px] text-slate-500">Daftar transaksi pencairan saldo ke rekening</p>
            </div>
            <span className="badge-purple">{settlements.length} Transaksi</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat riwayat settlement...</div>
          ) : settlements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada riwayat penarikan dana diajukan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID Settlement</th>
                    <th className="p-3">Tujuan</th>
                    <th className="p-3">Nominal Bersih</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {settlements.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{s.settlement_id}</td>
                      <td className="p-3 text-slate-700">
                        <div className="font-bold">{s.bank_name} - {s.account_number}</div>
                        <div className="text-[10px] text-slate-400 font-mono">a.n {s.account_name}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        Rp {Number(s.net_amount).toLocaleString("id-ID")}
                      </td>
                      <td className="p-3">
                        {s.status === "COMPLETED" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                            <i className="fa-solid fa-check"></i> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-yellow-200">
                            <i className="fa-solid fa-clock"></i> Diproses
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 text-right text-[11px]">
                        {new Date(s.created_at).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
