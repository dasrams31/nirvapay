# 💳 NirvaPay — Self-Hosted Multi-Merchant QRIS & Aggregator SaaS

<p align="center">
  <img src="https://nirvapay.dasrams.biz.id/favicon.svg" alt="NirvaPay Logo" width="90">
</p>

<p align="center">
  <b>Multi-Tenant QRIS Payment Gateway & Aggregator SaaS Platform</b><br>
  Direct EMVCo Dynamic QRIS Injection · Zero Fee Markup · Real-time Auto Settlement
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/Express.js-4.21-000000?style=flat-square&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Styling-Astro%20Design%20Tokens-BC52EE?style=flat-square&logo=astro" alt="Astro Styling">
  <img src="https://img.shields.io/badge/License-Proprietary-7C3AED?style=flat-square" alt="License">
</p>

---

## 🌟 Fitur Utama

- **🚀 Modern Architecture**: Full-stack Next.js 16 App Router dengan backend Express.js server & PostgreSQL database pooling.
- **🎨 Astro Design System**: Tampilan UI modern, responsif, dark palette (`#0B0D13`), aksen Astro Purple (`#7C3AED`), dan micro-ergonomics tinggi.
- **⚡ Dynamic EMVCo QRIS Generator**: Injeksi otomatis Tag 54 nominal dan CRC16-CCITT checksum tanpa API pihak ketiga.
- **🛡️ Multi-Channel Mutation Aggregator**: Integrasi mutasi otomatis dari GoPay/GoBiz, DANA Bisnis, KlikQRIS, dan BukaOlshop.
- **🔑 Multi-Merchant & API Keys**: Manajemen multi-merchant mandiri, secret key generation, dan otentikasi Bearer API standar.
- **🔔 Webhook Engine & Event Logging**: Pengiriman webhook callback otomatis dengan HMAC-SHA256 signature verification.
- **📊 Real-time Dashboard & Export**: Pelacakan status tagihan real-time, grafik omset, dan ekspor laporan transaksi format CSV.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend UI** | Next.js 16 (App Router), React 19, Tailwind CSS (Astro Design Tokens) |
| **Backend API** | Express.js, Next.js API Route Handlers, Node.js v26+ |
| **Database** | PostgreSQL (`nirvapay` DB) with `postgres.js` high-performance driver |
| **QR Engine** | EMVCo Tag 54 Injector & CRC16-CCITT Checksum Calculator |
| **Security** | JWT (jsonwebtoken), bcryptjs, HMAC-SHA256 webhook signatures |

---

## 🚀 Quick Start & Deployment

### 1. Konfigurasi Environment (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nirvapay
JWT_SECRET=AeternumNirvaPaySecretKey2026SecureSalt
PORT=8098
BASE_URL=https://nirvapay.dasrams.biz.id
NEXT_PUBLIC_APP_URL=https://nirvapay.dasrams.biz.id
ADMIN_TELEGRAM_ID=606533609
TELEGRAM_BOT_TOKEN=8623661389:AAF0l4J-ZgZg9H_OqW4X9W0w1Y6X5Z7V3YQ
NODE_ENV=production
```

### 2. Build & Jalankan Server
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server (Port 8098)
node server.js
```

### 3. Systemd Service (`/etc/systemd/system/nirvapay.service`)
```ini
[Unit]
Description=NirvaPay Multi-Merchant QRIS Gateway SaaS (Next.js + Express)
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/scripts/nirvapay
ExecStart=/home/ubuntu/.local/bin/node server.js
Restart=always
RestartSec=5
Environment=PATH=/home/ubuntu/.local/bin:/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production
Environment=PORT=8098

[Install]
WantedBy=multi-user.target
```

---

## 📖 Endpoint Dokumentasi API

### Base URL: `https://nirvapay.dasrams.biz.id/api/v1`

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Mendaftarkan akun merchant baru |
| `POST` | `/api/v1/auth/login` | Login merchant & generate JWT session |
| `POST` | `/api/v1/invoices` | Membuat transaksi QRIS Dinamis baru |
| `GET` | `/api/v1/invoices` | Mengambil riwayat daftar invoice |
| `GET` | `/api/v1/invoices/:id/status` | Mengecek status pembayaran real-time |
| `GET` | `/api/v1/invoices/:id/qr` | Menampilkan gambar PNG kode QRIS |
| `GET` | `/api/v1/keys` | Mengambil daftar Kunci API aktif |
| `POST` | `/api/v1/keys` | Regenerate API Key baru |
| `GET` | `/api/v1/export/csv` | Mengunduh rekap laporan transaksi CSV |
| `POST` | `/webhook/gopay` | Ingestion mutasi GoPay / GoBiz |
| `POST` | `/webhook/dana` | Ingestion mutasi DANA Bisnis |
| `POST` | `/webhook/klikqris` | Ingestion webhook KlikQRIS |

---

## 🔒 Lisensi & Hak Cipta
© 2026 PT Aeternum Kreasikan Bersama · Dilindungi Hak Cipta.
Dikelola di bawah ekosistem server `dasrams.biz.id`.
