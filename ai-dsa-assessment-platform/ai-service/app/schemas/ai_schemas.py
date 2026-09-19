from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ProblemContext(BaseModel):
    title: str
    statement: str
    inputDescription: str
    outputDescription: str
    constraints: List[str] = []
    examples: List[Dict[str, Any]] = []
    difficulty: str = "Moderate"
    topic: str = ""
    patterns: List[str] = []


class AIRequest(BaseModel):
    problem: ProblemContext
    studentCode: Optional[str] = None
    studentApproach: Optional[str] = None
    dataStructure: Optional[str] = None
    timeComplexity: Optional[str] = None
    spaceComplexity: Optional[str] = None
    testResults: Optional[List[Dict[str, Any]]] = None
    previousHints: Optional[List[str]] = None
    assessmentState: Optional[str] = None
    hintLevel: Optional[int] = 0
    userMessage: Optional[str] = None


class AIResponse(BaseModel):
    type: str
    message: str
    level: Optional[int] = None
    revealsSolution: bool = False
    metadata: Optional[Dict[str, Any]] = None
