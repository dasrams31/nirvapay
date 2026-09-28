"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Email atau password salah");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="NirvaPay" className="w-10 h-10 rounded-xl shadow-md" />
          <span className="text-2xl font-black tracking-tight text-slate-950">
            Nirva<span className="text-purple-800">Pay</span>
          </span>
        </Link>
        <Link
          href="/register"
          className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1.5"
        >
          Belum punya akun? <strong>Daftar Merchant</strong> <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="card-white p-8 md:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto text-xl shadow-sm">
              <i className="fa-solid fa-key"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Masuk Merchant</h1>
            <p className="text-xs text-slate-500 font-medium">
              Kelola pembayaran QRIS dan pantau transaksi live
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Merchant</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="email"
                  required
                  placeholder="admin@nirvapay.dasrams.biz.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-purple w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sekarang <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            Belum punya akun merchant?{" "}
            <Link href="/register" className="text-purple-800 font-bold hover:underline">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-slate-400 font-medium">
        © 2026 PT Aeternum Kreasikan Bersama. Multi-Merchant QRIS Aggregator.
      </div>
    </div>
  );
}
