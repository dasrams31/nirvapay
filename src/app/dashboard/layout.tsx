import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMerchant } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar (11 Modul Lengkap Sesuai Versi Asli) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 mb-6">
            <img src="/logo.svg" alt="NirvaPay Logo" className="w-9 h-9 rounded-xl shadow-sm" />
            <div>
              <span className="text-lg font-black text-slate-950">
                Nirva<span className="text-purple-800">Pay</span>
              </span>
              <span className="badge-gold ml-1.5 text-[9px] font-bold">MERCHANT</span>
            </div>
          </Link>

          {/* Merchant Profile Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                {merchant.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{merchant.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{merchant.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-2 font-mono">
            MENU UTAMA
          </div>
          <nav className="space-y-1 text-xs font-bold">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-chart-pie w-4 text-purple-700"></i> Ringkasan
            </Link>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-receipt w-4 text-purple-700"></i> Pembayaran & Invoice
            </Link>
            <Link
              href="/dashboard/mutations"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-money-bill-transfer w-4 text-purple-700"></i> Mutasi Masuk
            </Link>
            <Link
              href="/dashboard/connections"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-network-wired w-4 text-purple-700"></i> Koneksi Merchant
            </Link>
            <Link
              href="/dashboard/keys"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-key w-4 text-purple-700"></i> API Keys
            </Link>
            <Link
              href="/dashboard/webhooks"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-bolt w-4 text-purple-700"></i> Webhooks & Callback
            </Link>
            <Link
              href="/dashboard/docs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-book-bookmark w-4 text-purple-700"></i> Dokumentasi REST API
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-purple-50 hover:text-purple-800 transition"
            >
              <i className="fa-solid fa-gears w-4 text-purple-700"></i> Profil & QRIS Statis
            </Link>
          </nav>
        </div>

        {/* Footer Server Status & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800">Node Gateway</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <i className="fa-solid fa-circle text-[6px]"></i> Online
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 mt-1">Port: :8098 (Next.js 16)</div>
          </div>

          <form action="/api/v1/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-200"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Workspace Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-slate-900">Console Merchant</h1>
            <span className="badge-purple">Mode: Live Production</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <i className="fa-solid fa-store text-purple-700 mr-1"></i> {merchant.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/docs"
              className="text-xs font-bold text-slate-600 hover:text-purple-800 px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-code text-purple-700"></i> API Reference
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              ID: <strong className="text-purple-800">{merchant.merchantId}</strong>
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
