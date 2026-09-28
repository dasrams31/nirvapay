"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PayStatusChecker({
  invoiceId,
  redirectUrl,
}: {
  invoiceId: string;
  redirectUrl?: string | null;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const checkStatus = async () => {
    setChecking(true);
    setStatusMsg("Mengecek mutasi server...");
    try {
      const res = await fetch(`/api/v1/invoices/${invoiceId}/status`);
      const data = await res.json();
      if (data.status === "PAID") {
        setStatusMsg("🎉 Pembayaran Lunas!");
        setTimeout(() => {
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            router.refresh();
          }
        }, 1200);
      } else if (data.status === "EXPIRED") {
        router.refresh();
      } else {
        setStatusMsg("⏳ Pembayaran belum terdeteksi. Silakan transfer lalu coba lagi.");
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch {
      setStatusMsg("⚠️ Gangguan jaringan");
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setChecking(false);
    }
  };

  // Auto-poll every 5 seconds
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/invoices/${invoiceId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          clearInterval(timer);
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            router.refresh();
          }
        } else if (data.status === "EXPIRED") {
          clearInterval(timer);
          router.refresh();
        }
      } catch {
        // ignore background poll error
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [invoiceId, redirectUrl, router]);

  return (
    <div className="space-y-2">
      <button
        onClick={checkStatus}
        disabled={checking}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-astro-purple px-4 py-3 text-xs font-bold text-white shadow-glow hover:bg-astro-purpleGlow disabled:opacity-50 transition-all cursor-pointer"
      >
        {checking ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Memeriksa Mutasi...</span>
          </>
        ) : (
          <span>🔄 Cek Status Pembayaran</span>
        )}
      </button>

      {statusMsg && (
        <p className="text-center text-[11px] font-semibold text-astro-purpleGlow transition-all">
          {statusMsg}
        </p>
      )}
    </div>
  );
}
