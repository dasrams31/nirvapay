"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.redirect_url || "/dashboard";
      } else {
        setError(data.message || "Email atau password tidak sesuai");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="card-white max-w-md w-full p-8 sm:p-10 bg-white border border-slate-200 shadow-2xl relative z-10 rounded-3xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <img src="/logo.svg" alt="NirvaPay Logo" className="w-12 h-12 rounded-2xl shadow-md group-hover:scale-105 transition" />
            <span className="text-2xl font-black text-slate-950 tracking-tight">
              Nirva<span className="text-purple-800">Pay</span>
            </span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Masuk ke Console Merchant</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Kelola mutasi, QRIS dinamis, dan integrasi toko digital Anda
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Merchant</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <i className="fa-solid fa-envelope text-xs"></i>
              </span>
              <input
                type="email"
                required
                placeholder="nama@tokoanda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <i className="fa-solid fa-lock text-xs"></i>
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-purple-700 focus:ring-2 focus:ring-purple-100 transition text-sm"
              />
            </div>
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
            className="btn-purple w-full py-3.5 text-sm shadow-lg font-bold rounded-xl mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Memverifikasi Kredensial...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket text-yellow-400 mr-1.5"></i> Masuk ke Dashboard
              </>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500 mt-6 font-medium">
          Belum punya akun merchant?{" "}
          <Link href="/register" className="font-bold text-purple-700 hover:text-purple-900 hover:underline">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
