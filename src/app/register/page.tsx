"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          business_name: businessName || name,
          email,
          phone,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Gagal mendaftarkan akun merchant.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-pattern flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center text-white font-black text-xl shadow-md">
            N
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-950">
            Nirva<span className="text-purple-800">Pay</span>
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1.5"
        >
          Sudah punya akun? <strong>Masuk</strong> <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-lg mx-auto my-auto">
        <div className="card-white p-8 md:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 text-yellow-800 flex items-center justify-center mx-auto text-xl shadow-sm">
              <i className="fa-solid fa-store"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Registrasi Merchant</h1>
            <p className="text-xs text-slate-500 font-medium">
              Buat akun dalam 1 menit dan mulai terima pembayaran QRIS otomatis
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Ramadhana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Bisnis / Toko</label>
                <input
                  type="text"
                  placeholder="Aeternum Digital"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Merchant</label>
                <input
                  type="email"
                  required
                  placeholder="merchant@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-purple w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Mendaftarkan Akun...
                </>
              ) : (
                <>
                  Daftar Merchant Gratis <i className="fa-solid fa-rocket"></i>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            Sudah memiliki akun terdaftar?{" "}
            <Link href="/login" className="text-purple-800 font-bold hover:underline">
              Masuk Sekarang
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
