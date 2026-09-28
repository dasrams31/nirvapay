"use client";

import { useEffect, useState } from "react";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/v1/keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    const name = prompt("Nama API Key baru (misal: Production Bot Telegram):", "Live Key");
    if (!name) return;

    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Kunci API Merchant</h1>
          <p className="text-xs text-slate-500 font-medium">
            Gunakan Public & Secret Key ini untuk mengautentikasi request REST API ke NirvaPay
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="btn-purple text-xs flex items-center gap-2 shadow-sm shrink-0"
        >
          <i className="fa-solid fa-plus"></i> Buat Kunci API Baru
        </button>
      </div>

      <div className="card-white p-6 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-purple-800 text-lg mb-2"></i>
            <div>Memuat kunci API...</div>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada Kunci API dibuat. Klik tombol di atas untuk membuat.
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((k: any) => (
              <div
                key={k.id}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                      <i className="fa-solid fa-key"></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{k.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Dibuat: {new Date(k.created_at).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <span className="badge-purple">LIVE PRODUCTION</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 font-sans">Public Key (x-api-key)</div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl">
                      <span className="truncate flex-1 text-slate-800 font-semibold">{k.public_key}</span>
                      <button
                        onClick={() => copyToClipboard(k.public_key, `pub-${k.id}`)}
                        className="text-purple-800 hover:text-purple-950 font-sans font-bold text-xs shrink-0"
                      >
                        {copiedKey === `pub-${k.id}` ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 font-sans">Secret Key</div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl">
                      <span className="truncate flex-1 text-slate-800 font-semibold">{k.secret_key}</span>
                      <button
                        onClick={() => copyToClipboard(k.secret_key, `sec-${k.id}`)}
                        className="text-purple-800 hover:text-purple-950 font-sans font-bold text-xs shrink-0"
                      >
                        {copiedKey === `sec-${k.id}` ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
