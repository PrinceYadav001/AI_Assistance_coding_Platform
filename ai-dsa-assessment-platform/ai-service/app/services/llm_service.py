import logging
from typing import Optional
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Lazy-load LLM to avoid import errors if HF is not configured
_llm = None
_model = None


def get_llm():
    global _llm, _model
    if _llm is not None:
        return _model

    if not settings.HF_TOKEN:
        logger.warning("HF_TOKEN not set. AI service will use fallback responses.")
        return None

    try:
        from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

        _llm = HuggingFaceEndpoint(
            repo_id=settings.HF_MODEL,
            task="text-generation",
            huggingfacehub_api_token=settings.HF_TOKEN,
            max_new_tokens=settings.MAX_NEW_TOKENS,
            temperature=settings.TEMPERATURE,
        )
        _model = ChatHuggingFace(llm=_llm)
        logger.info(f"LLM initialized: {settings.HF_MODEL}")
        return _model
    except Exception as e:
        logger.error(f"Failed to initialize LLM: {e}")
        return None


async def call_llm(system_prompt: str, user_message: str) -> Optional[str]:
    """Call the LLM with a system prompt and user message."""
    model = get_llm()

    if model is None:
        return None

    try:
        from langchain_core.messages import SystemMessage, HumanMessage

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message),
        ]

        response = model.invoke(messages)
        return response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return None
