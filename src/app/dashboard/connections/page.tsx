"use client";

import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [channel, setChannel] = useState("GOPAY");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [credentialToken, setCredentialToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/v1/connections");
      const data = await res.json();
      if (data.success) {
        setConnections(data.connections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          account_identifier: accountIdentifier,
          credential_token: credentialToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccountIdentifier("");
        setCredentialToken("");
        fetchConnections();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Saluran Pembayaran & Mutasi</h1>
        <p className="text-xs text-slate-500 font-medium">
          Hubungkan akun GoPay Merchant, DANA Bisnis, KlikQRIS, atau BukaOlshop untuk verifikasi otomatis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Tambah Koneksi */}
        <div className="lg:col-span-5 card-white p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Hubungkan Saluran Baru</h2>
              <p className="text-[11px] text-slate-500">Pilih e-wallet atau gateway provider</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Jenis Saluran</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
              >
                <option value="GOPAY">GoPay Merchant (Direct QRIS)</option>
                <option value="KLIKQRIS">KlikQRIS Payment Aggregator</option>
                <option value="DANA">DANA Bisnis QRIS</option>
                <option value="BUKAOLSHOP">BukaOlshop Push Notification</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nomor Akun / Merchant ID</label>
              <input
                type="text"
                required
                placeholder="Misal: ID1026545081659 / 08123456789"
                value={accountIdentifier}
                onChange={(e) => setAccountIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Secret Token / API Session Key</label>
              <input
                type="password"
                required
                placeholder="Bearer token / Session secret"
                value={credentialToken}
                onChange={(e) => setCredentialToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-purple w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link"></i> Sambungkan Saluran
                </>
              )}
            </button>
          </form>
        </div>

        {/* Daftar Koneksi Aktif */}
        <div className="lg:col-span-7 card-white p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Saluran Terhubung</h2>
              <p className="text-[11px] text-slate-500">Daftar channel mutasi aktif untuk merchant Anda</p>
            </div>
            <span className="badge-purple">{connections.length} Terdaftar</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <i className="fa-solid fa-circle-notch fa-spin text-purple-800 text-lg mb-2"></i>
              <div>Memuat daftar saluran...</div>
            </div>
          ) : connections.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada saluran pembayaran terhubung. Silakan tambahkan di form sebelah kiri.
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:border-purple-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        {c.channel}
                        <span className="badge-gold text-[9px]">ONLINE</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{c.account_identifier}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                      <i className="fa-solid fa-check"></i> Siap Mutasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
