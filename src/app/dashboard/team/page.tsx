"use client";

import { useEffect, useState } from "react";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/v1/team");
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        setEmail("");
        setMsg("Anggota tim berhasil ditambahkan!");
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Manajemen Tim & Hak Akses (RBAC)</h1>
        <p className="text-xs text-slate-500 font-medium">
          Undang anggota tim, finance, operator kasir, atau developer untuk mengelola gateway toko bersama
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Tambah Anggota */}
        <div className="lg:col-span-5 card-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-base">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Tambah Anggota Tim</h2>
              <p className="text-[11px] text-slate-500">Tentukan peran dan hak akses</p>
            </div>
          </div>

          {msg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <i className="fa-solid fa-check text-emerald-600"></i>
              <span>{msg}</span>
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nama Anggota</label>
              <input
                type="text"
                required
                placeholder="Ahmad Fauzi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email Akun</label>
              <input
                type="email"
                required
                placeholder="ahmad@tokoonline.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Role / Hak Akses</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-700 focus:bg-white transition"
              >
                <option value="developer">Developer (API Keys, Webhooks, Log)</option>
                <option value="finance">Finance (Settlement, Laporan CSV, Saldo)</option>
                <option value="operator">Operator (Monitor Transaksi QRIS)</option>
                <option value="admin">Administrator (Akses Penuh)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-purple w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus"></i> Tambahkan ke Tim
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabel Anggota Tim */}
        <div className="lg:col-span-7 card-white p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Daftar Anggota</h2>
              <p className="text-[11px] text-slate-500">Akses user yang terhubung ke console merchant</p>
            </div>
            <span className="badge-purple">{members.length} User</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat anggota tim...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada anggota tim tambahan.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m: any) => (
                <div
                  key={m.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:border-purple-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{m.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge-gold text-[10px] uppercase">{m.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
