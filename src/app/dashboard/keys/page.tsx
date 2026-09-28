"use client";

import { useEffect, useState } from "react";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleRegenerate = async () => {
    if (!confirm("Regenerate Kunci API baru? Kunci baru akan langsung aktif.")) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/v1/keys", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchKeys();
      }
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Kunci API (API Keys)</h1>
          <p className="mt-1 text-xs text-astro-slate">Gunakan Secret Key untuk otentikasi API backend server Anda</p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="rounded-xl bg-astro-purple px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-astro-purpleGlow disabled:opacity-50 transition-all cursor-pointer"
        >
          {regenerating ? "Membuat Kunci Baru..." : "➕ Generate API Key Baru"}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="astro-card rounded-2xl p-8 text-center text-xs text-astro-slate">Memuat kunci API...</div>
        ) : keys.length === 0 ? (
          <div className="astro-card rounded-2xl p-8 text-center text-xs text-astro-slate">Belum ada Kunci API.</div>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="astro-card rounded-3xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-astro-border pb-3">
                <span className="text-sm font-bold text-white">{k.name}</span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 text-[11px] font-bold">
                  {k.is_active ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-astro-slate uppercase tracking-wider">Public Key</label>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-astro-border bg-astro-dark p-2.5 font-mono text-xs text-astro-cyan">
                    <span className="truncate mr-2">{k.public_key}</span>
                    <button
                      onClick={() => copyToClipboard(k.public_key, `pub-${k.id}`)}
                      className="rounded bg-astro-card px-2 py-1 text-[10px] font-bold text-white hover:bg-astro-purple transition-all shrink-0 cursor-pointer"
                    >
                      {copiedId === `pub-${k.id}` ? "✓ Tersalin" : "Salin"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-astro-slate uppercase tracking-wider">Secret Key (Private)</label>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-astro-border bg-astro-dark p-2.5 font-mono text-xs text-astro-purpleGlow">
                    <span className="truncate mr-2">{k.secret_key}</span>
                    <button
                      onClick={() => copyToClipboard(k.secret_key, `sec-${k.id}`)}
                      className="rounded bg-astro-card px-2 py-1 text-[10px] font-bold text-white hover:bg-astro-purple transition-all shrink-0 cursor-pointer"
                    >
                      {copiedId === `sec-${k.id}` ? "✓ Tersalin" : "Salin"}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-astro-slate">
                Dibuat pada: {new Date(k.created_at).toLocaleString("id-ID")}
                {k.last_used_at && ` · Terakhir dipakai: ${new Date(k.last_used_at).toLocaleString("id-ID")}`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
