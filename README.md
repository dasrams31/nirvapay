# 💳 NirvaPay — Self-Hosted Multi-Merchant QRIS Gateway & Aggregator SaaS

<p align="center">
  <img src="https://nirvapay.dasrams.biz.id/logo.svg" alt="NirvaPay Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Next-Gen Self-Hosted QRIS Dynamic Gateway & Merchant SaaS Aggregator</strong><br>
  <em>Designed with High-Precision Architecture (Next.js 16 + Express.js + PostgreSQL)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Backend-Express.js-10B981?style=flat-square&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Standard-EMVCo%20QRIS-700070?style=flat-square" alt="QRIS">
  <img src="https://img.shields.io/badge/Security-HMAC--SHA256-FFCC00?style=flat-square" alt="HMAC">
</p>

---

## 🚀 Overview

**NirvaPay** adalah platform SaaS agregator dan gateway pembayaran QRIS dinamis (*Dynamic EMVCo QRIS*) mandiri yang dirancang untuk toko online, bot Telegram digital, web apps, dan developer. 

Dibangun dengan arsitektur non-glassmorphism, tema klasik *Crisp White Canvas*, *Tekhelet Purple* (`#700070`), dan *Jonquil Gold* (`#FFCC00`), menghadirkan performa settlement instan tanpa biaya potongan pihak ketiga.

---

## 🌟 Key Features

- ⚡ **Dynamic QRIS Generator**: Membuat QR code berstandar QRIS Nasional (EMVCo) dengan kode unik otomatis untuk verifikasi instan.
- 🔄 **Multi-Channel Settlement**: Mendukung direct connection GoPay Merchant, DANA Bisnis, KlikQRIS, dan Push Notification BukaOlshop.
- 🛡️ **HMAC-SHA256 Webhook Security**: Pengiriman notifikasi callback otomatis dengan signature kriptografi untuk menjamin validitas transaksi.
- 📊 **Tactile Merchant Console**: Dashboard analitik real-time, manajemen Kunci API (Public/Secret), ekspor laporan CSV/Excel, dan invoice tracker.
- 🤖 **Telegram Bot & Webhook Ready**: Terintegrasi langsung dengan ekosistem Aeternum bot (@aeternum_premibot) & web store (@shop.dasrams.biz.id).

---

## 🛠️ Tech Stack & Architecture

```text
CLIENT / BROWSER / TELEGRAM BOT
               │
               ▼
   [ Nginx Reverse Proxy ] (HTTPS / SSL)
               │
               ▼  Port :8098
┌────────────────────────────────────────────────────────┐
│  NirvaPay Server (server.js + Next.js App Router)      │
│  ├── Express.js (Health, Raw Proxying, Cors)           │
│  ├── Next.js 16 (Turbopack, SSR, API Route Handlers)   │
│  └── Edge Auth & HMAC Token Verification Engine        │
└──────────────────────────────┬─────────────────────────┘
                               │
                               ▼
     [ PostgreSQL Database: nirvapay (Port 5432) ]
     ├── merchants (Multi-Tenant Profile & Balance)
     ├── api_keys (Live Public & Secret Keys)
     ├── payment_invoices (Dynamic QRIS Invoices)
     ├── merchant_connections (GoPay, DANA, KlikQRIS)
     └── webhook_endpoints & webhook_logs
```

---

## 📖 REST API Quick Reference

### 1. Membuat Tagihan QRIS Dinamis
```bash
curl -X POST "https://nirvapay.dasrams.biz.id/api/v1/invoices" \
  -H "x-api-key: pub_live_xxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "customer_name": "Rama Danadipa",
    "customer_email": "admin@nirvapay.dasrams.biz.id",
    "customer_phone": "08123456789",
    "payment_channel": "GOPAY",
    "callback_url": "https://domainanda.com/api/webhook"
  }'
```

### 2. Polling Status Pembayaran
```bash
curl -X GET "https://nirvapay.dasrams.biz.id/api/v1/invoices/INV-1024/status"
```

---

## 💻 Self-Hosting & Development

```bash
# Clone repository
git clone https://github.com/dasrams31/nirvapay.git
cd nirvapay

# Install dependencies
npm install

# Build Next.js
npm run build

# Start server
npm start
```

---

## 🔒 Security & Boundaries
- Never commit `.env` credentials, private secret keys, or database passwords.
- Always use `x-api-key` header for API authentication.
- Webhook endpoints require strict HMAC verification.

---
© 2026 **PT Aeternum Kreasikan Bersama**. Maintained by **@dasrams31**.
