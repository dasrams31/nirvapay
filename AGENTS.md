# NirvaPay — Self-Hosted Multi-Merchant QRIS & Aggregator SaaS

## Overview
- **Purpose**: Self-hosted multi-channel QRIS Payment Gateway and merchant aggregator SaaS platform.
- **Stack**: Python 3.11+, FastAPI, SQLAlchemy (Async), aiosqlite / PostgreSQL, Tailwind CSS, Vanilla JS.
- **Port**: `:8098`
- **Design Philosophy**: Non-glassmorphism, White Base (`#FFFFFF`/`#F8FAFC`), Purple (`#700070`) & Jonquil Gold (`#FFCC00`) accents, High-Density Tactical UI.

## Commands
- Setup / Install Dependencies:
  ```bash
  cd /home/ubuntu/scripts/nirvapay && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt
  ```
- Run Server:
  ```bash
  cd /home/ubuntu/scripts/nirvapay && ./venv/bin/python main.py
  ```
- Test Health / Status:
  ```bash
  curl -s http://127.0.0.1:8098/docs
  ```

## Architecture & Endpoints
- Public Landing: `GET /`
- Merchant Dashboard: `GET /dashboard`
- Customer Checkout: `GET /pay/{invoice_id}`
- Dynamic QR Generator: `GET /api/v1/invoices/{invoice_id}/qr`
- Payment Polling: `GET /api/v1/invoices/{invoice_id}/status`
- Webhook Ingestion: `POST /webhook/gopay`, `POST /webhook/dana`, `POST /api/v1/bukaolshop/callback`
- Export Reports: `GET /api/v1/export/csv`

## Boundaries
- Never commit private keys, `.env` secrets, or merchant authentication cookies.
- Do not store raw plaintext secret credentials in logs.
