import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    HF_MODEL: str = os.getenv("HF_MODEL", "openai/gpt-oss-120b")
    PORT: int = int(os.getenv("PORT", "8001"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    MAX_NEW_TOKENS: int = int(os.getenv("MAX_NEW_TOKENS", "1024"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))

settings = Settings()
