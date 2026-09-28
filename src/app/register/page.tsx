"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [staticQris, setStaticQris] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ownerName.trim(),
          business_name: businessName.trim() || ownerName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          static_qris_payload: staticQris.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Pendaftaran gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="card-white max-w-xl w-full p-8 sm:p-10 bg-white border border-slate-200 shadow-2xl relative z-10 rounded-3xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-2 group">
            <img src="/logo.svg" alt="NirvaPay Logo" className="w-12 h-12 rounded-2xl shadow-md group-hover:scale-105 transition" />
            <span className="text-2xl font-black text-slate-950 tracking-tight">
              Nirva<span className="text-purple-800">Pay</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Buka Akun Merchant Baru</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Mulai terima pembayaran QRIS otomatis untuk toko online & bot Anda
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Bisnis / Toko</label>
              <input
                type="text"
                required
                placeholder="Contoh: Maju Jaya Store"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Pemilik</label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="owner@tokoonline.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">No. WhatsApp / HP</label>
              <input
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password Baru</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              String QRIS Statis Merchant (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="000201010211... (Bisa diisi nanti di menu Pengaturan)"
              value={staticQris}
              onChange={(e) => setStaticQris(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-rose-600 shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-purple w-full py-3.5 text-xs shadow-lg font-bold rounded-xl mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Memproses Pendaftaran...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus text-yellow-400 mr-1.5"></i> Daftar & Dapatkan API Keys
              </>
            )}
          </button>
        </form>

        <div className="pt-5 border-t border-slate-100 text-center text-xs text-slate-500 mt-5 font-medium">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-purple-700 hover:text-purple-900 hover:underline">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
}
