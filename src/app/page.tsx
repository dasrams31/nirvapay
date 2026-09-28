import Link from "next/link";
import { getCurrentMerchant } from "@/lib/auth";

export default async function LandingPage() {
  const merchant = await getCurrentMerchant();

  return (
    <div className="min-h-screen bg-astro-dark text-astro-text astro-mesh selection:bg-astro-purple selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-astro-border bg-astro-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-astro-purple to-astro-cyan shadow-glow">
              <span className="font-black text-white text-base">N</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">NirvaPay</span>
            <span className="rounded-full border border-astro-purple/40 bg-astro-purple/10 px-2 py-0.5 text-[10px] font-bold text-astro-purpleGlow">
              v2.0 Next.js
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-astro-slate">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#channels" className="hover:text-white transition-colors">Saluran Pembayaran</a>
            <a href="#api" className="hover:text-white transition-colors">Developer API</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            {merchant ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-astro-purple px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-astro-purpleGlow transition-all"
              >
                Masuk Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-astro-border px-4 py-2 text-sm font-semibold text-astro-slate hover:bg-astro-card hover:text-white transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-astro-purple px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-astro-purpleGlow transition-all"
                >
                  Daftar Merchant
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center lg:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-astro-border bg-astro-card/80 px-3.5 py-1.5 text-xs font-semibold text-astro-slate shadow-soft mb-6">
          <span className="h-2 w-2 rounded-full bg-astro-emerald animate-pulse"></span>
          Direct EMVCo Dynamic QRIS Gateway · 0% Markup Fee
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl astro-gradient-text leading-[1.1]">
          Payment Gateway QRIS Dinamis Multi-Merchant Mandiri
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-astro-slate leading-relaxed">
          Terima pembayaran instan dari GoPay, OVO, DANA, BCA, ShopeePay, dan seluruh bank di Indonesia dengan verifikasi mutasi otomatis real-time.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-astro-purple to-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-glow hover:opacity-95 transition-all"
          >
            <span>Mulai Gratis Sekarang</span>
            <span>→</span>
          </Link>
          <a
            href="/dashboard/docs"
            className="flex items-center gap-2 rounded-2xl border border-astro-border bg-astro-card px-6 py-3.5 text-base font-semibold text-astro-slate hover:bg-astro-cardHover hover:text-white transition-all"
          >
            <span>Dokumentasi API</span>
            <span className="font-mono text-xs text-astro-purpleGlow">REST</span>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-20 grid gap-6 md:grid-cols-3 text-left">
          <div className="astro-card rounded-3xl p-6 shadow-soft space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-astro-purple/10 border border-astro-purple/20 text-astro-purpleGlow font-bold">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">Dynamic EMVCo Injection</h3>
            <p className="text-sm text-astro-slate leading-relaxed">
              Kalkulasi otomatis Tag 54 nominal dan CRC16-CCITT checksum standar Bank Indonesia & ASPI secara instan.
            </p>
          </div>

          <div className="astro-card rounded-3xl p-6 shadow-soft space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-astro-cyan/10 border border-astro-cyan/20 text-astro-cyan font-bold">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-white">Auto-Settlement & Webhook</h3>
            <p className="text-sm text-astro-slate leading-relaxed">
              Penerimaan mutasi otomatis via MacroDroid/Tasker forwarder dengan HMAC-SHA256 signature dispatching.
            </p>
          </div>

          <div className="astro-card rounded-3xl p-6 shadow-soft space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-astro-emerald/10 border border-astro-emerald/20 text-astro-emerald font-bold">
              📊
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Merchant & Analytics</h3>
            <p className="text-sm text-astro-slate leading-relaxed">
              Dashboard lengkap manajemen invoice, pemantauan saldo dompet, ekspor CSV, dan API Key multi-proyek.
            </p>
          </div>
        </div>
      </section>

      {/* Code Demo Section */}
      <section id="api" className="border-t border-astro-border/50 bg-astro-card/40 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="rounded-full bg-astro-purple/10 border border-astro-purple/20 px-3 py-1 text-xs font-bold text-astro-purpleGlow">
                Developer Friendly
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Integrasi dalam 3 Baris Kode
              </h2>
              <p className="mt-4 text-sm text-astro-slate leading-relaxed">
                Gunakan REST API standar industri untuk membuat invoice, mengambil status pembayaran, dan mendengarkan webhook callback di server aplikasi kamu.
              </p>
              
              <ul className="mt-6 space-y-2.5 text-xs text-astro-slate">
                <li className="flex items-center gap-2">
                  <span className="text-astro-emerald font-bold">✓</span>
                  <span>Header otentikasi Bearer API Key standar</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-astro-emerald font-bold">✓</span>
                  <span>Anti-collision unique amount code protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-astro-emerald font-bold">✓</span>
                  <span>Webhook event idempotency & auto-retry</span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-astro-border bg-astro-dark shadow-glow">
              <div className="flex items-center justify-between border-b border-astro-border px-4 py-2.5 bg-astro-card text-xs text-astro-slate">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="ml-2 font-mono">POST /api/v1/invoices</span>
                </div>
                <span className="font-mono text-[10px]">JSON</span>
              </div>
              <pre className="p-4 font-mono text-xs text-astro-slate overflow-x-auto leading-relaxed">
{`curl -X POST https://nirvapay.dasrams.biz.id/api/v1/invoices \\
  -H "Authorization: Bearer sec_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "merchant_ref": "ORDER-1001",
    "customer_name": "Rama Danadipa",
    "callback_url": "https://yourapp.com/webhook"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-astro-border bg-astro-dark py-8 text-center text-xs text-astro-slate">
        <p>© 2026 NirvaPay · PT Aeternum Kreasikan Bersama. All rights reserved.</p>
        <p className="mt-1">Powered by Next.js, Express.js & PostgreSQL on dasrams.biz.id</p>
      </footer>
    </div>
  );
}
