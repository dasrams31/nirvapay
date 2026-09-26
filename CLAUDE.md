# NirvaPay Developer & Assistant Guide

## Project Summary
NirvaPay is a standalone self-hosted multi-channel QRIS payment gateway SaaS built with FastAPI and modern white/purple-gold UI.

## Environment & Run
- Directory: `/home/ubuntu/scripts/nirvapay`
- Python runtime: Python 3.11+ / venv
- Port: `8098`

## Coding Standards
- Python: PEP 8, Pydantic v2 schemas, type annotations on all async functions.
- Frontend: High contrast, non-glassmorphism, crisp 1px borders, white canvas with `#700070` purple and `#FFCC00` gold accents.
- Security: Parameterized queries, constant-time secret comparison, CRC16-CCITT EMVCo tag calculations.
