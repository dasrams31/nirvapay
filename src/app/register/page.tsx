"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, business_name: businessName, email, password, phone }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setErrorMsg(data.message || "Gagal mendaftar");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-astro-dark px-4 py-12 astro-mesh text-astro-text selection:bg-astro-purple selection:text-white">
      <div className="w-full max-w-md rounded-3xl border border-astro-border bg-astro-card p-8 shadow-glow space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-astro-purple to-astro-cyan shadow-glow font-black text-white">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-white">NirvaPay</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Daftar Akun Merchant</h1>
          <p className="mt-1 text-xs text-astro-slate">Dapatkan API Key dan mulai terima QRIS instan dalam 1 menit</p>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ramadhana"
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none focus:ring-1 focus:ring-astro-purple"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Nama Bisnis / Toko</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Aeternum Store"
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none focus:ring-1 focus:ring-astro-purple"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bisnis.com"
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none focus:ring-1 focus:ring-astro-purple"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-astro-slate">Password (min. 6 karakter)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-astro-border bg-astro-dark px-3.5 py-2.5 text-sm text-white placeholder:text-astro-slate/40 focus:border-astro-purple focus:outline-none focus:ring-1 focus:ring-astro-purple"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-astro-purple py-3 text-sm font-bold text-white shadow-glow hover:bg-astro-purpleGlow disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Mendaftarkan Akun..." : "Buat Akun Merchant →"}
          </button>
        </form>

        <p className="text-center text-xs text-astro-slate">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-astro-purpleGlow hover:underline">
            Masuk Disini
          </Link>
        </p>
      </div>
    </div>
  );
}
