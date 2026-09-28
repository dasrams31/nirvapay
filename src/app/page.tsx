import Link from "next/link";
import { getCurrentMerchant } from "@/lib/auth";

export default async function LandingPage() {
  const merchant = await getCurrentMerchant();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="NirvaPay" className="w-11 h-11 rounded-2xl shadow-md group-hover:scale-105 transition" />
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-950">
                  Nirva<span className="text-purple-800">Pay</span>
                </span>
                <span className="badge-gold ml-1.5 text-[10px] font-bold">GATEWAY 2.0</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
              <a href="#fitur" className="hover:text-purple-800 transition flex items-center gap-1.5">
                <i className="fa-solid fa-wand-magic-sparkles text-yellow-500"></i> Fitur & Solusi
              </a>
              <a href="#keunggulan" className="hover:text-purple-800 transition">
                Keunggulan
              </a>
              <a href="#channel" className="hover:text-purple-800 transition">
                Metode Pembayaran
              </a>
              <Link href="/dashboard/docs" className="hover:text-purple-800 transition flex items-center gap-1.5">
                <i className="fa-solid fa-code text-purple-700"></i> REST API Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3.5">
            {merchant ? (
              <Link
                href="/dashboard"
                className="btn-purple text-xs flex items-center gap-2 shadow-md"
              >
                <i className="fa-solid fa-gauge"></i> Console ({merchant.name.split(" ")[0]})
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-50 rounded-xl transition border border-purple-200"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="btn-purple text-xs shadow-md flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-bolt text-yellow-400"></i> Daftar Merchant Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow relative hero-pattern">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none"></div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black tracking-wide shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Platform Agregator & QRIS Otomatis #1 di Indonesia
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                Terima Pembayaran QRIS{" "}
                <span className="text-purple-800 underline decoration-yellow-400 decoration-wavy">
                  Otomatis & Cepat
                </span>{" "}
                Tanpa Ribet!
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                Hubungkan QRIS GoPay Merchant, DANA, Toko BukaOlshop, dan Bot Telegram Anda ke satu gateway pintar. Settlement otomatis dalam 1 detik langsung masuk ke rekening/wallet Anda tanpa biaya perantara.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="btn-purple px-8 py-4 text-sm font-bold shadow-xl shadow-purple-900/20 hover:scale-105 transition-transform rounded-2xl flex items-center gap-2"
                >
                  <i className="fa-solid fa-rocket text-yellow-400 text-base"></i> Buka Akun Toko Gratis
                </Link>
                <Link
                  href="/dashboard/docs"
                  className="bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 px-6 py-4 text-sm rounded-2xl transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-book-bookmark text-purple-800"></i> Pelajari API Docs
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i> 0% Potongan Biaya Tambahan
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-purple-700 text-base"></i> Standar Keamanan EMVCo BI
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-bolt text-yellow-500 text-base"></i> 99.98% Uptime Garansi
                </div>
              </div>
            </div>

            {/* Right Mascot & Tactile Visual Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="card-white p-7 shadow-2xl max-w-sm w-full relative z-10 border border-slate-200">
                {/* Floating Mascot Avatar Badge */}
                <div className="absolute -top-10 -right-4 w-20 h-20 bg-gradient-to-tr from-purple-900 to-purple-700 rounded-2xl border-4 border-white shadow-xl flex flex-col items-center justify-center text-center z-20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                  </div>
                  <div className="w-3 h-1 bg-white/90 rounded-full"></div>
                  <span className="text-[8px] font-black text-yellow-300 font-mono mt-1">NIRVA-BOT</span>
                </div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-black text-xs text-slate-800 tracking-tight font-mono">LIVE SIMULATOR</span>
                  </div>
                  <span className="badge-gold text-[10px]">AUTO VERIFIED</span>
                </div>

                {/* Simulated Invoice Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mb-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan Pelanggan</div>
                  <div className="text-3xl font-black font-mono text-purple-950">Rp 25.143</div>
                  <div className="text-[10px] text-emerald-700 font-bold">Termasuk Kode Unik 143</div>

                  {/* Mock QR Frame */}
                  <div className="mt-3 p-3 bg-white border border-slate-300 rounded-2xl inline-block shadow-sm">
                    <div className="w-36 h-36 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center text-white text-center relative overflow-hidden">
                      <i className="fa-solid fa-qrcode text-5xl text-yellow-400 mb-1"></i>
                      <span className="text-[8px] font-mono text-purple-300 font-bold tracking-tight">DYNAMIC QRIS</span>
                      <span className="text-[7px] text-slate-400">EMVCo Certified</span>
                    </div>
                  </div>
                </div>

                {/* Live Feed Status */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950">Mutasi Masuk!</div>
                    <div className="text-[10px] text-emerald-800">Order #1024 Lunas dalam 1.2 detik</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Payment Methods */}
        <section id="channel" className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8">
              Mendukung Semua Pembayaran QRIS & E-Wallet Nasional
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 font-black text-slate-700 text-sm sm:text-base">
              <div className="flex items-center gap-2 hover:text-purple-800 transition">
                <i className="fa-solid fa-qrcode text-purple-700 text-2xl"></i> QRIS Nasional
              </div>
              <div className="flex items-center gap-2 hover:text-purple-800 transition">
                <i className="fa-solid fa-wallet text-emerald-600 text-2xl"></i> GoPay Merchant
              </div>
              <div className="flex items-center gap-2 hover:text-purple-800 transition">
                <i className="fa-solid fa-mobile text-sky-600 text-2xl"></i> DANA Indonesia
              </div>
              <div className="flex items-center gap-2 hover:text-purple-800 transition">
                <i className="fa-solid fa-bag-shopping text-orange-600 text-2xl"></i> ShopeePay
              </div>
              <div className="flex items-center gap-2 hover:text-purple-800 transition">
                <i className="fa-solid fa-building-columns text-blue-800 text-2xl"></i> BCA / Mandiri / BRI
              </div>
            </div>
          </div>
        </section>

        {/* Solutions & Features Cards */}
        <section id="fitur" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="badge-purple font-bold text-xs">SOLUSI BISNIS DIGITAL</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Dirancang Khusus untuk Berbagai Skala Toko
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                Mulai dari toko online, bot Telegram digital, web SaaS, hingga aplikasi mobile Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Bot Telegram Store */}
              <div className="card-white p-8 rounded-3xl hover:border-purple-300 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
                    <i className="fa-brands fa-telegram text-yellow-500"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Bot & MiniApp Telegram</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                    Terhubung langsung dengan bot Telegram jualan akun / produk digital. Pelanggan klik beli, QRIS tergenerate instan, dan produk otomatis terkirim saat dana masuk.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs font-bold text-purple-800 flex items-center gap-1">
                  Integrasi Webhook Bot <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </div>
              </div>

              {/* Card 2: BukaOlshop Integration */}
              <div className="card-white p-8 rounded-3xl hover:border-purple-300 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
                    <i className="fa-solid fa-cart-shopping text-yellow-500"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Aplikasi Toko BukaOlshop</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                    Pasang Callback IPN NirvaPay di aplikasi BukaOlshop Anda. Otomatisasi proses pesanan tanpa perlu cek mutasi manual di HP merchant.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs font-bold text-purple-800 flex items-center gap-1">
                  Auto IPN Verification <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </div>
              </div>

              {/* Card 3: Web & API Developer */}
              <div className="card-white p-8 rounded-3xl hover:border-purple-300 transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
                    <i className="fa-solid fa-code text-yellow-500"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Website & Aplikasi Mandiri</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                    REST API super cepat dengan SDK cURL, Python, Node.js, dan PHP Laravel. Dilengkapi signature HMAC-SHA256 untuk keamanan level perbankan.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs font-bold text-purple-800 flex items-center gap-1">
                  <Link href="/dashboard/docs" className="hover:underline">
                    Baca Dokumentasi SDK
                  </Link>{" "}
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Box Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl border border-purple-800">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="badge-gold text-xs">GRATIS PENDAFTARAN</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Siap Memaksimalkan Penjualan Bisnis Digital Anda?
              </h2>
              <p className="text-sm text-purple-200 font-medium">
                Buka akun merchant Anda sekarang dan nikmati kemudahan settlement otomatis tanpa potongan pihak ketiga.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-2xl text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <i className="fa-solid fa-user-plus"></i> Daftar Akun Merchant Sekarang
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="NirvaPay" className="w-8 h-8 rounded-lg shadow-sm" />
            <div>
              <span className="text-sm font-black text-slate-900">NirvaPay Platform</span>
              <p className="text-[11px] text-slate-400 font-medium">
                © 2026 PT Aeternum Kreasikan Bersama. All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link href="/login" className="hover:text-purple-800">
              Login Merchant
            </Link>
            <Link href="/dashboard" className="hover:text-purple-800">
              Console
            </Link>
            <Link href="/dashboard/docs" className="hover:text-purple-800">
              API Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
