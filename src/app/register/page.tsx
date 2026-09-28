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
          email: email.trim().toLowerCase(),
          phone,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Gagal mendaftarkan akun merchant");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between hero-pattern overflow-x-hidden">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="NirvaPay" className="w-11 h-11 rounded-2xl shadow-md group-hover:scale-105 transition" />
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-950">
                Nirva<span className="text-purple-800">Pay</span>
              </span>
              <span className="badge-gold ml-1.5 text-[10px] font-bold">GATEWAY 2.0</span>
            </div>
          </Link>

          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-purple-800 px-3 py-2 transition"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Kembali ke Beranda
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-50 rounded-xl transition border border-purple-200"
            >
              Sudah punya akun? <strong>Masuk</strong>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Ambient Color Accents */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-lg my-8 relative z-10">
          <div className="card-white p-8 sm:p-10 shadow-2xl border border-slate-200 rounded-3xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-900 flex items-center justify-center mx-auto text-2xl shadow-sm">
                <i className="fa-solid fa-store text-yellow-600"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Registrasi Merchant</h1>
              <p className="text-xs text-slate-600 font-medium">
                Buat akun dalam 1 menit dan mulai terima pembayaran QRIS otomatis
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
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
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Bisnis / Toko</label>
                  <input
                    type="text"
                    placeholder="Aeternum Digital"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
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
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
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
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-800 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-purple w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 mt-2 rounded-xl"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    Daftar Merchant Gratis <i className="fa-solid fa-rocket text-yellow-400"></i>
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
              Sudah memiliki akun terdaftar?{" "}
              <Link href="/login" className="text-purple-800 font-bold hover:underline">
                Masuk Sekarang
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
        © 2026 PT Aeternum Kreasikan Bersama. Multi-Merchant QRIS Aggregator.
      </footer>
    </div>
  );
}
