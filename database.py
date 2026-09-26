import json
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from config import settings
from models import ApiKey, Base, MerchantConnection

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

    # Seed Default Data
    async with async_session() as session:
        # 1. Seed Master ApiKey
        stmt_key = select(ApiKey).limit(1)
        res_key = await session.execute(stmt_key)
        if not res_key.scalar_one_or_none():
            master_key = ApiKey(
                name="Production Default Key",
                public_key=settings.MASTER_PUBLIC_KEY,
                secret_key=settings.MASTER_SECRET_KEY,
                is_sandbox=False,
                is_active=True,
                ip_whitelist="",
            )
            sandbox_key = ApiKey(
                name="Sandbox Testing Key",
                public_key="pub_sand_nirva_7730129bc4",
                secret_key="sec_sand_nirva_0128fb6541cc",
                is_sandbox=True,
                is_active=True,
                ip_whitelist="",
            )
            session.add_all([master_key, sandbox_key])

        # 2. Seed Default Merchant Connections
        channels = [
            ("gopay", "GoPay Merchant (GoBiz)", True, "Active & Polling", {"mode": "notification_and_direct", "min_unique": 1, "max_unique": 499}),
            ("dana", "DANA Forwarder Node", True, "Connected", {"webhook_secret": "nirva_dana_2026", "auto_approve": True}),
            ("shopeepay", "ShopeePay Merchant", False, "Standby", {"merchant_id": ""}),
            ("static_qris", "National Dynamic QRIS Engine", True, "Active (EMVCo)", {"nmid": "ID1026545081659", "merchant_name": "Aeternum Kreasikan Bersam"}),
            ("bukaolshop", "BukaOlshop Callback IPN", True, "Ready for Webhook", {"secret_auth": "bukaolshop_auth_2026"}),
        ]

        for code, name, is_act, status_txt, cfg in channels:
            stmt_c = select(MerchantConnection).where(MerchantConnection.channel == code)
            res_c = await session.execute(stmt_c)
            if not res_c.scalar_one_or_none():
                conn_item = MerchantConnection(
                    channel=code,
                    name=name,
                    is_active=is_act,
                    status_text=status_txt,
                    config_json=json.dumps(cfg),
                )
                session.add(conn_item)

        await session.commit()
    logger.info("NirvaPay Database initialized successfully.")
