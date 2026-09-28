"use client";

import { useEffect, useState } from "react";

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/webhooks");
      const data = await res.json();
      if (data.success) {
        setEndpoints(data.endpoints);
        setLogs(data.logs);
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, events: ["payment.success", "payment.expired"] }),
      });
      const data = await res.json();
      if (data.success) {
        setUrl("");
        fetchData();
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
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Webhook Notifications</h1>
        <p className="text-xs text-slate-500 font-medium">
          Terima notifikasi payload JSON secara otomatis saat pelanggan menyelesaikan pembayaran QRIS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Tambah Webhook Endpoint */}
        <div className="lg:col-span-5 card-white p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Pasang URL Callback</h2>
              <p className="text-[11px] text-slate-500">Endpoint HTTP POST di server Anda</p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Webhook Target URL (HTTPS)</label>
              <input
                type="url"
                required
                placeholder="https://api.domainanda.com/webhook/nirvapay"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
              />
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved"></i> Keamanan Signature
              </div>
              <p className="text-slate-600">
                Setiap event akan dikirim dengan header <code>X-NirvaPay-Signature</code> (HMAC SHA-256) menggunakan Secret Key Anda.
              </p>
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
                  <i className="fa-solid fa-plus"></i> Simpan Webhook
                </>
              )}
            </button>
          </form>
        </div>

        {/* Daftar Webhook Logs & Endpoints */}
        <div className="lg:col-span-7 card-white p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Endpoint Terdaftar</h2>
            <div className="mt-3 space-y-2">
              {endpoints.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                  Belum ada URL webhook terpasang.
                </div>
              ) : (
                endpoints.map((ep: any) => (
                  <div
                    key={ep.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <span className="truncate text-slate-800 font-semibold">{ep.url}</span>
                    <span className="badge-purple text-[10px] font-sans">ACTIVE</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-sm font-extrabold text-slate-900">Riwayat Pengiriman Webhook</h2>
            <p className="text-[11px] text-slate-500 mb-3">10 log pengiriman callback terakhir</p>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Memuat log...</div>
            ) : logs.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 text-center">
                Belum ada log dispatching webhook.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{log.event_type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString("id-ID")}
                      </div>
                    </div>
                    <span
                      className={`font-bold font-mono text-xs ${
                        log.response_status === 200 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      HTTP {log.response_status || "ERR"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
