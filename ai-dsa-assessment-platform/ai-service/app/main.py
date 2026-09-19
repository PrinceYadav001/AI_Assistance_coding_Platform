import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.ai_schemas import AIRequest, AIResponse
from app.services.llm_service import call_llm
from app.services.prompt_service import load_prompt, build_problem_context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI DSA Assessment Service",
    description="Python FastAPI AI service using LangChain + Hugging Face",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "AI DSA Assessment AI Service"}


# Fallback responses when LLM is unavailable
FALLBACK_RESPONSES = {
    "CLARIFICATION": "Let me help you understand this problem. Read the problem statement carefully, focusing on: (1) What is given as input, (2) What output is expected, (3) The constraints that must be satisfied. Start with the examples — they always illuminate the pattern.",
    "PLAN": "Before I review your approach, tell me: what is your current thinking? What data structure are you considering, and why? Walk me through your logic step by step.",
    "HINT": "Think about what operation you need to perform most frequently. What data structure gives you the best time complexity for that operation?",
    "DEBUG": "Look carefully at your edge cases. What happens when the input is empty? What about a single element? Trace through your code manually with the simplest failing test case.",
    "DRY_RUN": "To trace your code, take the first example input and walk through each line, tracking the value of every variable at each step. What is the state after the first iteration?",
    "OPTIMIZE": "Your current approach likely has a bottleneck. Identify the slowest part — is there a loop inside a loop? What data structure could turn that O(n) search into O(1)?",
    "REVIEW": "Check your solution against all the constraints. Does it handle the maximum input size efficiently? Have you considered all edge cases mentioned in the problem?",
    "CHAT": "I'm here to help you succeed! What specific aspect of this problem are you struggling with? Remember: understand the problem fully before writing any code.",
}


async def process_ai_request(request: AIRequest, interaction_type: str) -> AIResponse:
    """Process an AI request with LLM or fallback."""
    context = build_problem_context(request)
    system_prompt = load_prompt(interaction_type.lower()) or load_prompt("clarification")
    
    user_message = request.userMessage or f"Help me with this problem. Type: {interaction_type}"
    
    full_message = f"{context}\n\nStudent says: {user_message}"
    
    response_text = await call_llm(system_prompt, full_message)
    
    if response_text is None:
        response_text = FALLBACK_RESPONSES.get(interaction_type, FALLBACK_RESPONSES["CHAT"])
    
    return AIResponse(
        type=interaction_type,
        message=response_text,
        level=request.hintLevel,
        revealsSolution=False,
    )


@app.post("/api/ai/chat", response_model=AIResponse)
async def chat(request: AIRequest):
    return await process_ai_request(request, "CHAT")


@app.post("/api/ai/explain", response_model=AIResponse)
async def explain(request: AIRequest):
    return await process_ai_request(request, "CLARIFICATION")


@app.post("/api/ai/review-approach", response_model=AIResponse)
async def review_approach(request: AIRequest):
    return await process_ai_request(request, "PLAN")


@app.post("/api/ai/hint", response_model=AIResponse)
async def hint(request: AIRequest):
    """Progressive hint based on hint level."""
    context = build_problem_context(request)
    system_prompt = load_prompt("hint") or ""
    
    hint_level = request.hintLevel or 0
    user_message = f"Give me hint level {hint_level + 1} for this problem."
    full_message = f"{context}\n\nHint level requested: {hint_level + 1}\n{user_message}"
    
    # Use stored hints if LLM unavailable
    hints_by_level = [
        "Look at the pattern — what category of algorithm does this problem belong to?",
        "Consider the data structure that best matches the operations you need (lookup, insertion, ordering).",
        "Key insight: focus on what information you need to track from previous iterations.",
        "Can you improve your brute force by avoiding repeated computations? What if you precompute something?",
        "Pseudocode: Initialize → Iterate → For each element, decide based on [key condition] → Return result.",
        "The optimal approach involves [data structure]. In each iteration: [key step]. Time: O(n), Space: O(n).",
    ]
    
    response_text = await call_llm(system_prompt, full_message)
    if response_text is None:
        idx = min(hint_level, len(hints_by_level) - 1)
        response_text = hints_by_level[idx]
    
    return AIResponse(
        type="HINT",
        message=response_text,
        level=hint_level + 1,
        revealsSolution=hint_level >= 5,
    )


@app.post("/api/ai/debug", response_model=AIResponse)
async def debug(request: AIRequest):
    return await process_ai_request(request, "DEBUG")


@app.post("/api/ai/dry-run", response_model=AIResponse)
async def dry_run(request: AIRequest):
    return await process_ai_request(request, "DRY_RUN")


@app.post("/api/ai/optimize", response_model=AIResponse)
async def optimize(request: AIRequest):
    return await process_ai_request(request, "OPTIMIZE")


@app.post("/api/ai/evaluate", response_model=AIResponse)
async def evaluate(request: AIRequest):
    return await process_ai_request(request, "REVIEW")


if __name__ == "__main__":
    import uvicorn
    from app.config.settings import settings
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
