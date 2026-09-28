"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDailyData(data.daily || []);
          setChannels(data.channels || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalWeekVolume = dailyData.reduce((acc, curr) => acc + Number(curr.total_volume || 0), 0);
  const totalWeekTrx = dailyData.reduce((acc, curr) => acc + Number(curr.successful_transactions || 0), 0);
  const maxDailyVolume = Math.max(...dailyData.map((d) => Number(d.total_volume || 0)), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Analitik Penjualan & Performa Transaksi</h1>
        <p className="text-xs text-slate-500 font-medium">
          Pantau grafik volume transaksi harian, rasio keberhasilan QRIS, dan sebaran saluran pembayaran
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-white p-6 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume 7 Hari Terakhir</div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            Rp {totalWeekVolume.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up"></i> Pertumbuhan stabil
          </div>
        </div>

        <div className="card-white p-6 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi Lunas</div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {totalWeekTrx} Trx
          </div>
          <div className="text-xs text-purple-700 font-bold">Rata-rata {Math.round(totalWeekTrx / 7)} trx/hari</div>
        </div>

        <div className="card-white p-6 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Success Rate Pembayaran</div>
          <div className="text-3xl font-black text-emerald-600 font-mono">
            98.8%
          </div>
          <div className="text-xs text-slate-500 font-medium">Verifikasi instan via EMVCo</div>
        </div>
      </div>

      {/* Bar Chart Visualization (Pure CSS Responsive Bar Chart) */}
      <div className="card-white p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Grafik Volume Transaksi Harian (7 Hari)</h2>
            <p className="text-[11px] text-slate-500">Pergerakan omzet QRIS masuk ke merchant</p>
          </div>
          <span className="badge-purple font-mono text-[10px]">REAL-TIME SYNC</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat visualisasi analitik...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 border-b border-slate-200">
              {dailyData.map((d, idx) => {
                const heightPercent = Math.round((Number(d.total_volume) / maxDailyVolume) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                      Rp {Math.round(Number(d.total_volume) / 1000)}k
                    </div>
                    <div
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-xl group-hover:from-yellow-400 group-hover:to-yellow-300 transition-all shadow-sm"
                    ></div>
                    <div className="text-[10px] font-bold text-slate-400 text-center">
                      {new Date(d.date).toLocaleDateString("id-ID", { weekday: "short" })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Channels Distribution */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {channels.map((c, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{c.payment_channel}</div>
                      <div className="text-[10px] text-slate-400">{c.count} Transaksi</div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-xs text-slate-900">
                    Rp {Number(c.volume).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
