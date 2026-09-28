"use client";

import { useEffect, useState } from "react";

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/v1/webhooks");
      const data = await res.json();
      if (data.success) {
        setEndpoints(data.endpoints || []);
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✓ Webhook endpoint berhasil didaftarkan!");
        setUrl("");
        await fetchWebhooks();
      } else {
        setMsg("⚠️ " + (data.message || "Gagal menambahkan webhook"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Webhook & Real-Time Logs</h1>
        <p className="mt-1 text-xs text-astro-slate">Kirim notifikasi settlement pembayaran otomatis ke server aplikasi kamu</p>
      </div>

      {msg && (
        <div className="rounded-xl border border-astro-purple/30 bg-astro-purple/10 p-3 text-xs font-semibold text-astro-purpleGlow">
          {msg}
        </div>
      )}

      {/* Add Webhook Form */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Daftarkan URL Endpoint Baru</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourapp.com/api/payment/callback"
            className="flex-1 rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-xs text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-astro-purple px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-astro-purpleGlow disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {loading ? "Menyimpan..." : "Tambah Endpoint"}
          </button>
        </form>
      </div>

      {/* Endpoints List */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-white">Endpoint Terdaftar</h2>
        <div className="space-y-3">
          {endpoints.length === 0 ? (
            <p className="text-xs text-astro-slate py-4">Belum ada URL webhook terdaftar.</p>
          ) : (
            endpoints.map((ep) => (
              <div key={ep.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-astro-border bg-astro-dark p-4">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-white truncate block">{ep.url}</span>
                  <span className="font-mono text-[10px] text-astro-slate">Secret: {ep.secret_key}</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold w-fit">
                  AKTIF
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Delivery Logs */}
      <div className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-white">Riwayat Pengiriman Webhook Terakhir (Logs)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-astro-border text-astro-slate uppercase tracking-wider">
              <tr>
                <th className="pb-3 font-bold">Invoice</th>
                <th className="pb-3 font-bold">Target URL</th>
                <th className="pb-3 font-bold">HTTP Status</th>
                <th className="pb-3 font-bold">Hasil</th>
                <th className="pb-3 font-bold">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-astro-border/50 text-astro-text">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-astro-slate">
                    Belum ada riwayat pengiriman webhook.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-astro-dark/50">
                    <td className="py-3 font-mono font-bold text-white">{log.invoice_id}</td>
                    <td className="py-3 font-mono text-astro-slate truncate max-w-xs">{log.endpoint_url}</td>
                    <td className="py-3 font-mono">{log.response_status}</td>
                    <td className="py-3">
                      {log.success ? (
                        <span className="text-emerald-400 font-bold">✓ Sukses</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ Gagal</span>
                      )}
                    </td>
                    <td className="py-3 text-astro-slate">
                      {new Date(log.created_at).toLocaleString("id-ID")}
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
