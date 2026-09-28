import Link from "next/link";
import { getCurrentMerchant } from "@/lib/auth";

export default async function LandingPage() {
  const merchant = await getCurrentMerchant();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center text-white font-black text-xl shadow-md">
                N
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-slate-950">
                  Nirva<span className="text-purple-800">Pay</span>
                </span>
                <span className="badge-gold ml-2 text-[10px]">GATEWAY 2.0</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
              <a href="#fitur" className="hover:text-purple-800 transition flex items-center gap-1.5">
                <i className="fa-solid fa-wand-magic-sparkles text-yellow-500"></i> Fitur & Solusi
              </a>
              <a href="#keunggulan" className="hover:text-purple-800 transition">
                Keunggulan
              </a>
              <a href="#integrasi" className="hover:text-purple-800 transition">
                Integrasi Channel
              </a>
              <Link href="/dashboard/docs" className="hover:text-purple-800 transition flex items-center gap-1.5">
                <i className="fa-solid fa-code text-slate-400"></i> REST API Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {merchant ? (
              <Link
                href="/dashboard"
                className="btn-purple text-sm flex items-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-gauge"></i> Dashboard ({merchant.name.split(" ")[0]})
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-700 hover:text-purple-800 px-4 py-2 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-purple text-sm flex items-center gap-2 shadow-sm"
                >
                  Daftar Merchant <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-pattern py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Infrastruktur Multi-Channel QRIS Realtime & Stabil
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Solusi Agregator <span className="text-purple-800">QRIS Dinamis</span> untuk Bisnis Digital & Bot Anda
              </h1>

              <p className="text-lg text-slate-600 font-medium max-w-2xl leading-relaxed">
                Terima pembayaran otomatis dari seluruh e-wallet & mobile banking di Indonesia (GoPay, OVO, DANA, BCA, ShopeePay). Integrasi cepat via Webhook, SDK & REST API.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="btn-purple w-full sm:w-auto text-base px-8 py-3.5 flex items-center justify-center gap-3 shadow-md"
                >
                  Mulai Sekarang Gratis <i className="fa-solid fa-rocket"></i>
                </Link>
                <Link
                  href="/dashboard/docs"
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 px-6 py-3.5 rounded-xl transition text-base flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-book text-slate-400"></i> Baca Dokumentasi
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-emerald-600 text-base"></i> 0% Fee Transaksi
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-yellow-500 text-base"></i> Settlement Cepat
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-purple-800 text-base"></i> Self-Hosted & Aman
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="card-white p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                      <i className="fa-solid fa-qrcode text-lg"></i>
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-sm">Simulasi QRIS Dinamis</h2>
                      <p className="text-xs text-slate-500">Auto Generate Standar EMVCo</p>
                    </div>
                  </div>
                  <span className="badge-purple">LIVE TEST</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</div>
                  <div className="text-3xl font-black text-slate-950 font-mono">Rp 50.321</div>
                  <div className="text-[11px] text-slate-500">Termasuk kode unik verifikasi otomatis</div>
                </div>

                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>Merchant</span>
                    <span className="text-slate-900 font-bold">PT Aeternum Kreasi Digital</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>ID Transaksi</span>
                    <span className="font-mono font-bold text-slate-900">INV-883921-TEST</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Status Notifikasi</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <i className="fa-solid fa-circle-check"></i> Webhook Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-950">Nirva<span className="text-purple-800">Pay</span></span>
            <span className="text-xs text-slate-400">© 2026 PT Aeternum Kreasikan Bersama. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-500">
            <Link href="/dashboard/docs" className="hover:text-purple-800">API Documentation</Link>
            <Link href="/login" className="hover:text-purple-800">Merchant Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
