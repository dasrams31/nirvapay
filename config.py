import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "NirvaPay"
    APP_ENV: str = os.getenv("APP_ENV", "production")
    PORT: int = int(os.getenv("PORT", "8098"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nirvapay-super-secret-key-2026-purp-gold")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/nirvapay.db")

    # Brand Colors (INAPSI Palette)
    PRIMARY_PURPLE: str = "#700070"
    DEEP_PURPLE: str = "#4A1B9D"
    ACCENT_GOLD: str = "#FFCC00"
    ALERT_ORANGE: str = "#FF7900"

    # Default Merchant QRIS (EMVCo)
    DEFAULT_STATIC_QRIS: str = os.getenv(
        "DEFAULT_STATIC_QRIS",
        "00020101021126610014COM.GO-JEK.WWW01189360091433293320900210G3293320900303UMI"
        "51440014ID.CO.QRIS.WWW0215ID10265450816590303UMI5204899953033605802ID"
        "5925Aeternum Kreasikan Bersam6006SLEMAN61055558462140703A0111036216304D2F5",
    )

    # Master API Keys
    MASTER_PUBLIC_KEY: str = os.getenv("MASTER_PUBLIC_KEY", "pub_live_nirva_98831a29f8")
    MASTER_SECRET_KEY: str = os.getenv("MASTER_SECRET_KEY", "sec_live_nirva_e3b829c7140f912b")

    # Telegram Alert Bot Config
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", os.getenv("BOT_TOKEN", "8623661389:AAEZ1P3X3XfXzE3tT7PZ31xXq819921_nirva"))
    TELEGRAM_ADMIN_CHAT_ID: str = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "606533609")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
