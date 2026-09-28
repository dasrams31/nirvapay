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
    <div className="flex min-h-screen bg-astro-dark text-astro-text selection:bg-astro-purple selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-astro-border bg-astro-card/80 p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-6">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-astro-purple to-astro-cyan shadow-glow font-black text-white text-sm">
              N
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">NirvaPay</span>
              <span className="block text-[10px] text-astro-purpleGlow font-mono font-medium">Gateway SaaS</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>📊</span>
              <span>Ringkasan</span>
            </Link>

            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>🧾</span>
              <span>Daftar Transaksi</span>
            </Link>

            <Link
              href="/dashboard/keys"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>🔑</span>
              <span>Kunci API (Keys)</span>
            </Link>

            <Link
              href="/dashboard/connections"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>⚡</span>
              <span>Saluran QRIS</span>
            </Link>

            <Link
              href="/dashboard/webhooks"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>🔔</span>
              <span>Webhook & Logs</span>
            </Link>

            <Link
              href="/dashboard/docs"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-astro-slate hover:bg-astro-dark hover:text-white transition-all"
            >
              <span>📖</span>
              <span>Dokumentasi API</span>
            </Link>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-astro-border/80 pt-4 space-y-3">
          <div className="px-2">
            <p className="text-xs font-bold text-white truncate">{merchant.name}</p>
            <p className="text-[11px] text-astro-slate truncate">{merchant.email}</p>
          </div>

          <form action="/api/v1/auth/logout" method="post">
            <button
              type="submit"
              className="w-full rounded-xl border border-astro-border bg-astro-dark/60 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              Keluar (Logout)
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-astro-border bg-astro-card/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-astro-slate">Merchant ID:</span>
            <span className="rounded-md bg-astro-purple/10 border border-astro-purple/30 px-2.5 py-0.5 font-mono text-xs font-bold text-astro-purpleGlow">
              #{merchant.merchantId}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://shop.dasrams.biz.id"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-astro-border bg-astro-dark px-3 py-1.5 font-medium text-astro-slate hover:text-white hover:border-astro-purple transition-all"
            >
              <span>🛒 Aeternum Shop</span>
              <span>↗</span>
            </a>
            <Link
              href="/"
              className="rounded-lg bg-astro-purple px-3 py-1.5 font-bold text-white shadow-soft hover:bg-astro-purpleGlow transition-all"
            >
              Landing Page
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
