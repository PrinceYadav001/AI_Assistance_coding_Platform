import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

PROMPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")

_prompt_cache = {}


def load_prompt(name: str) -> str:
    """Load a prompt template from file with caching."""
    if name in _prompt_cache:
        return _prompt_cache[name]

    path = os.path.join(PROMPTS_DIR, f"{name}.txt")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            _prompt_cache[name] = content
            return content
    except FileNotFoundError:
        logger.warning(f"Prompt file not found: {path}")
        return ""


def build_problem_context(request) -> str:
    """Build a formatted problem context string."""
    p = request.problem
    ctx = f"""PROBLEM: {p.title}
DIFFICULTY: {p.difficulty}
TOPIC: {p.topic}
PATTERNS: {', '.join(p.patterns)}

STATEMENT:
{p.statement}

INPUT: {p.inputDescription}
OUTPUT: {p.outputDescription}

CONSTRAINTS:
{chr(10).join(f"- {c}" for c in p.constraints)}

EXAMPLES:
"""
    for i, ex in enumerate(p.examples[:3], 1):
        ctx += f"\nExample {i}:\nInput: {ex.get('input', '')}\nOutput: {ex.get('output', '')}\n"
        if ex.get("explanation"):
            ctx += f"Explanation: {ex['explanation']}\n"

    if request.studentCode:
        ctx += f"\nSTUDENT CODE:\n```java\n{request.studentCode}\n```"

    if request.studentApproach:
        ctx += f"\nSTUDENT APPROACH: {request.studentApproach}"

    if request.dataStructure:
        ctx += f"\nDATA STRUCTURE CHOSEN: {request.dataStructure}"

    if request.timeComplexity:
        ctx += f"\nTIME COMPLEXITY CLAIMED: {request.timeComplexity}"

    if request.spaceComplexity:
        ctx += f"\nSPACE COMPLEXITY CLAIMED: {request.spaceComplexity}"

    if request.testResults:
        failed = [r for r in request.testResults if r.get("status") != "PASSED"]
        if failed:
            ctx += f"\nFAILED TESTS ({len(failed)}):"
            for r in failed[:3]:
                ctx += f"\n  Input: {r.get('input', '')} | Expected: {r.get('expected', '')} | Got: {r.get('actual', '')}"

    if request.previousHints:
        ctx += f"\nPREVIOUS HINTS GIVEN: {len(request.previousHints)}"

    if request.hintLevel is not None:
        ctx += f"\nCURRENT HINT LEVEL: {request.hintLevel}"

    return ctx
