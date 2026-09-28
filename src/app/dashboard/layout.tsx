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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-800 flex items-center justify-center text-white font-black text-sm">
              N
            </div>
            <span className="text-xl font-black tracking-tight text-slate-950">
              Nirva<span className="text-purple-800">Pay</span>
            </span>
          </Link>
          <span className="badge-purple text-[10px]">SaaS</span>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
              {merchant.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate">{merchant.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{merchant.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-xs font-bold">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-chart-pie w-4 text-center"></i> Ringkasan & Saldo
          </Link>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-receipt w-4 text-center"></i> Transaksi & Invoice
          </Link>
          <Link
            href="/dashboard/keys"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-key w-4 text-center"></i> Kunci API Merchant
          </Link>
          <Link
            href="/dashboard/connections"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-tower-broadcast w-4 text-center"></i> Saluran Pembayaran
          </Link>
          <Link
            href="/dashboard/webhooks"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-bolt w-4 text-center"></i> Webhook Callback
          </Link>
          <Link
            href="/dashboard/docs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-purple-800 transition"
          >
            <i className="fa-solid fa-book-bookmark w-4 text-center"></i> Dokumentasi API
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-200">
          <form action="/api/v1/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition border border-rose-200"
            >
              <i className="fa-solid fa-right-from-bracket"></i> Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-extrabold text-slate-900">Portal Merchant</h1>
            <span className="badge-gold text-[10px]">PRODUCTION</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/docs"
              className="text-xs font-bold text-slate-600 hover:text-purple-800 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-code text-slate-400"></i> Integrasi API
            </Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-xs font-semibold text-slate-500">
              ID: <code className="font-mono font-bold text-purple-800">{merchant.merchantId}</code>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
