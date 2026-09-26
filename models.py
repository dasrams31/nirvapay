from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    business_name: Mapped[str] = mapped_column(String(128))
    owner_name: Mapped[str] = mapped_column(String(128), default="Merchant Owner")
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    static_qris_payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    webhook_secret: Mapped[str] = mapped_column(String(64), default="nirva_sec_default")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PaymentInvoice(Base):
    __tablename__ = "payment_invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    invoice_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    merchant_ref: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    unique_code: Mapped[int] = mapped_column(Integer, default=0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, index=True)
    status: Mapped[str] = mapped_column(String(20), default="PENDING", index=True) # PENDING, PAID, EXPIRED, CANCELLED

    customer_name: Mapped[str] = mapped_column(String(128), default="Pelanggan")
    customer_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    customer_email: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    payment_channel: Mapped[str] = mapped_column(String(32), default="QRIS")
    qris_payload: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    callback_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    return_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expired_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class Mutation(Base):
    __tablename__ = "mutations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    channel: Mapped[str] = mapped_column(String(32), default="GOPAY") # GOPAY, DANA, SHOPEEPAY, QRIS, BANK
    amount: Mapped[float] = mapped_column(Float, index=True)
    sender: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    transaction_ref: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_matched: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    matched_invoice_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MerchantConnection(Base):
    __tablename__ = "merchant_connections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    channel: Mapped[str] = mapped_column(String(32)) # gopay, dana, shopeepay, static_qris, bukaolshop
    name: Mapped[str] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    config_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status_text: Mapped[str] = mapped_column(String(64), default="Ready")
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    name: Mapped[str] = mapped_column(String(64), default="Default Key")
    public_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    secret_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    is_sandbox: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    ip_whitelist: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WebhookEndpoint(Base):
    __tablename__ = "webhook_endpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    url: Mapped[str] = mapped_column(String(512))
    secret_key: Mapped[str] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    events_json: Mapped[str] = mapped_column(String(255), default='["payment.paid","payment.expired"]')
    last_delivery_status: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_id: Mapped[int] = mapped_column(Integer, default=1, index=True)
    webhook_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    invoice_id: Mapped[str] = mapped_column(String(64), index=True)
    event: Mapped[str] = mapped_column(String(32))
    payload_json: Mapped[Text] = mapped_column(Text)
    response_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    response_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="SUCCESS")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text)
