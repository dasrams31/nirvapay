"use client";

import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [channel, setChannel] = useState("GOPAY");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [staticQris, setStaticQris] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      const res = await fetch("/api/v1/connections");
      const data = await res.json();
      if (data.success) {
        setConnections(data.connections);
        if (data.connections.length > 0) {
          const first = data.connections[0];
          setChannel(first.channel || "GOPAY");
          setAccountNumber(first.account_number || "");
          setAccountName(first.account_name || "");
          setStaticQris(first.static_qris || "");
          setWebhookSecret(first.webhook_secret || "");
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          account_number: accountNumber,
          account_name: accountName,
          static_qris: staticQris,
          webhook_secret: webhookSecret,
          auto_confirm: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✓ Pengaturan saluran pembayaran berhasil disimpan!");
        await fetchConnections();
      } else {
        setMsg("⚠️ " + (data.message || "Gagal menyimpan"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Saluran Pembayaran & QRIS Engine</h1>
        <p className="mt-1 text-xs text-astro-slate">Konfigurasi akun QRIS statis merchant, webhook secret, dan auto-settlement</p>
      </div>

      {msg && (
        <div className="rounded-xl border border-astro-purple/30 bg-astro-purple/10 p-3 text-xs font-semibold text-astro-purpleGlow">
          {msg}
        </div>
      )}

      <div className="astro-card rounded-3xl p-6 md:p-8 shadow-soft">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Pilih Saluran / Provider</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white focus:border-astro-purple focus:outline-none"
            >
              <option value="GOPAY">GoPay / GoBiz Merchant (Direct EMVCo Dynamic)</option>
              <option value="DANA">DANA Bisnis QRIS</option>
              <option value="KLIKQRIS">KlikQRIS Payment Gateway</option>
              <option value="BUKAOLSHOP">BukaOlshop Mutasi Otomatis</option>
              <option value="MANUAL">Manual Bank Transfer / QRIS Statis Lainnya</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Nama Merchant / Akun</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Contoh: Aeternum Store"
                className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Nomor Akun / ID Merchant</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 08123456789 atau ID Merchant"
                className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">
              String Payload QRIS Statis Asli (EMVCo)
            </label>
            <textarea
              value={staticQris}
              onChange={(e) => setStaticQris(e.target.value)}
              placeholder="00020101021126610014COM.GO-JEK.WWW...6304XXXX"
              rows={3}
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none"
            />
            <span className="text-[11px] text-astro-slate block mt-1">
              *Jika dikosongkan, NirvaPay akan menggunakan default QRIS Merchant GoPay Aeternum terintegrasi.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">
              Secret Key Forwarder Webhook
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="AeternumGoBiz2026Secret"
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-astro-purple px-6 py-2.5 text-sm font-bold text-white shadow-glow hover:bg-astro-purpleGlow disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? "Menyimpan..." : "Simpan Pengaturan Saluran →"}
          </button>
        </form>
      </div>
    </div>
  );
}
