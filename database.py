import json
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from config import settings
from models import ApiKey, Base, Merchant, MerchantConnection
from auth import hash_password

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)

async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed Default Master Merchant
    async with async_session() as session:
        stmt_m = select(Merchant).where(Merchant.id == 1)
        res_m = await session.execute(stmt_m)
        master_merchant = res_m.scalar_one_or_none()
        
        if not master_merchant:
            master_merchant = Merchant(
                id=1,
                email="admin@nirvapay.dasrams.biz.id",
                password_hash=hash_password("admin123"),
                business_name="Aeternum Kreasikan Bersama",
                owner_name="Rama Danadipa",
                phone_number="089697100997",
                static_qris_payload=settings.DEFAULT_STATIC_QRIS,
                webhook_secret="AeternumGoBiz2026Secret",
                is_active=True,
                is_admin=True,
            )
            session.add(master_merchant)
            await session.commit()

        # Seed Master ApiKey
        stmt_key = select(ApiKey).where(ApiKey.merchant_id == 1)
        res_key = await session.execute(stmt_key)
        if not res_key.scalar_one_or_none():
            master_key = ApiKey(
                merchant_id=1,
                name="Production Live Key",
                public_key=settings.MASTER_PUBLIC_KEY,
                secret_key=settings.MASTER_SECRET_KEY,
                is_sandbox=False,
                is_active=True,
                ip_whitelist="",
            )
            sandbox_key = ApiKey(
                merchant_id=1,
                name="Sandbox Testing Key",
                public_key="pub_sand_nirva_7730129bc4",
                secret_key="sec_sand_nirva_0128fb6541cc",
                is_sandbox=True,
                is_active=True,
                ip_whitelist="",
            )
            session.add_all([master_key, sandbox_key])

        # Seed Merchant Connections
        channels = [
            ("gopay", "GoPay Merchant (GoBiz)", True, "Active & Polling", {"mode": "notification_and_direct", "min_unique": 1, "max_unique": 499}),
            ("dana", "DANA Forwarder Node", True, "Connected", {"webhook_secret": "nirva_dana_2026", "auto_approve": True}),
            ("shopeepay", "ShopeePay Merchant", False, "Standby", {"merchant_id": ""}),
            ("static_qris", "National Dynamic QRIS Engine", True, "Active (EMVCo)", {"nmid": "ID1026545081659", "merchant_name": "Aeternum Kreasikan Bersam"}),
            ("bukaolshop", "BukaOlshop Callback IPN", True, "Ready for Webhook", {"secret_auth": "bukaolshop_auth_2026"}),
        ]

        for code, name, is_act, status_txt, cfg in channels:
            stmt_c = select(MerchantConnection).where(
                MerchantConnection.merchant_id == 1,
                MerchantConnection.channel == code,
            )
            res_c = await session.execute(stmt_c)
            if not res_c.scalar_one_or_none():
                conn_item = MerchantConnection(
                    merchant_id=1,
                    channel=code,
                    name=name,
                    is_active=is_act,
                    status_text=status_txt,
                    config_json=json.dumps(cfg),
                )
                session.add(conn_item)

        await session.commit()
    logger.info("NirvaPay Multi-Tenant Database initialized successfully.")
