"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [qrisString, setQrisString] = useState("");
  const [qrisNmid, setQrisNmid] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/v1/keys")
      .then(() => {
        // Also fetch merchant profile
        fetch("/api/v1/auth/login")
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/v1/merchant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          business_name: businessName,
          phone,
          qris_static_string: qrisString,
          qris_nmid: qrisNmid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Pengaturan berhasil disimpan!");
      } else {
        setMsg(data.message || "Gagal menyimpan pengaturan");
      }
    } catch (err: any) {
      setMsg("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Profil Merchant & Konfigurasi QRIS</h1>
        <p className="text-xs text-slate-500 font-medium">
          Kelola informasi identitas toko Anda dan pasang payload QRIS Statis untuk auto-generator
        </p>
      </div>

      <div className="card-white p-8 space-y-6">
        {msg && (
          <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-bold flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-purple-700"></i>
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nama Pemilik</label>
              <input
                type="text"
                required
                placeholder="Ramadhana"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nama Toko / Bisnis</label>
              <input
                type="text"
                placeholder="Aeternum Ecosystem"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">No. WhatsApp / HP</label>
            <input
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <label className="font-bold text-slate-700">String QRIS Statis Merchant</label>
            <p className="text-[11px] text-slate-500 font-normal mb-1">
              Salin teks payload string QRIS statis dari aplikasi GoPay Merchant, DANA Bisnis, atau bank Anda (dimulai dengan <code>00020101...</code>).
            </p>
            <textarea
              rows={3}
              placeholder="00020101021126610014COM.GO-JEK.WWW..."
              value={qrisString}
              onChange={(e) => setQrisString(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-700 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">NMID QRIS (National Merchant Identifier)</label>
            <input
              type="text"
              placeholder="ID1026545081659"
              value={qrisNmid}
              onChange={(e) => setQrisNmid(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-700 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-purple px-6 py-3 text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Simpan Konfigurasi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
