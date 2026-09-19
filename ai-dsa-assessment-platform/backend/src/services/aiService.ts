import axios from 'axios';
import { config } from '../config/config';

export interface AIRequestContext {
  problem: {
    title: string;
    statement: string;
    inputDescription: string;
    outputDescription: string;
    constraints: string[];
    examples: Array<{ input: string; output: string; explanation?: string }>;
    difficulty: string;
    topic: string;
    patterns: string[];
  };
  studentCode?: string;
  studentApproach?: string;
  dataStructure?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testResults?: Array<{ status: string; input: string; expected: string; actual: string }>;
  previousHints?: string[];
  assessmentState?: string;
  hintLevel?: number;
  userMessage?: string;
}

export interface AIResponse {
  type: string;
  message: string;
  level?: number;
  revealsSolution?: boolean;
  metadata?: Record<string, unknown>;
}

async function callAIService(endpoint: string, context: AIRequestContext): Promise<AIResponse> {
  try {
    const res = await axios.post(
      `${config.aiServiceUrl}${endpoint}`,
      context,
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return res.data;
  } catch (err) {
    console.error(`AI service error at ${endpoint}:`, err);
    throw new Error('AI_SERVICE_UNAVAILABLE');
  }
}

export async function getAIChat(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/chat', context);
}

export async function getAIExplanation(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/explain', context);
}

export async function reviewApproach(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/review-approach', context);
}

export async function getHint(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/hint', context);
}

export async function debugCode(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/debug', context);
}

export async function dryRunCode(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/dry-run', context);
}

export async function optimizeCode(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/optimize', context);
}

export async function evaluateSolution(context: AIRequestContext): Promise<AIResponse> {
  return callAIService('/api/ai/evaluate', context);
}

// Fallback responses when AI service is unavailable
export function getFallbackResponse(type: string): AIResponse {
  const messages: Record<string, string> = {
    CHAT: 'I\'m temporarily unavailable. Please try again in a moment.',
    CLARIFICATION: 'Read the problem statement carefully, paying attention to the constraints and examples.',
    HINT: 'Think about what data structure would be most efficient for the operations you need to perform.',
    DEBUG: 'Check your edge cases - what happens with empty input or a single element?',
    DRY_RUN: 'Walk through your code manually with the first example to trace variable values.',
    OPTIMIZE: 'Consider if you can reduce the time complexity by using a more efficient data structure.',
    REVIEW: 'Verify your approach handles all the constraints mentioned in the problem.',
  };

  return {
    type,
    message: messages[type] || messages.CHAT,
    revealsSolution: false,
  };
}
