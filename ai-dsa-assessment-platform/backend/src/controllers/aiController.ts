import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Assessment } from '../models/Assessment';
import { Problem, IProblem } from '../models/Problem';
import { AIInteraction } from '../models/AIInteraction';
import * as aiService from '../services/aiService';
import { createError } from '../middleware/errorHandler';

async function buildContext(assessmentId: string, userId: string, userMessage?: string): Promise<aiService.AIRequestContext> {
  const assessment = await Assessment.findById(assessmentId).populate<{ problemId: IProblem }>('problemId');
  if (!assessment) throw createError('Assessment not found', 404, 'NOT_FOUND');
  if (assessment.userId.toString() !== userId) throw createError('Forbidden', 403, 'FORBIDDEN');

  const problem = assessment.problemId as IProblem;
  const prevInteractions = await AIInteraction.find({ assessmentId }).sort({ createdAt: 1 }).limit(10);

  return {
    problem: {
      title: problem.title,
      statement: problem.statement,
      inputDescription: problem.inputDescription,
      outputDescription: problem.outputDescription,
      constraints: problem.constraints,
      examples: problem.examples,
      difficulty: problem.difficulty,
      topic: problem.topic,
      patterns: problem.patterns,
    },
    studentCode: assessment.code,
    studentApproach: assessment.approach,
    dataStructure: assessment.dataStructure,
    timeComplexity: assessment.timeComplexity,
    spaceComplexity: assessment.spaceComplexity,
    testResults: assessment.testResults?.slice(0, 5).map((r) => ({
      status: r.status,
      input: r.isHidden ? '[hidden]' : r.input,
      expected: r.isHidden ? '[hidden]' : r.expected,
      actual: r.isHidden ? '[hidden]' : r.actual,
    })),
    previousHints: prevInteractions
      .filter((i) => i.type === 'HINT')
      .map((i) => i.response),
    assessmentState: assessment.currentStep,
    hintLevel: assessment.hintLevel,
    userMessage,
  };
}

async function saveInteraction(
  userId: string,
  assessmentId: string,
  problemId: string,
  message: string,
  response: aiService.AIResponse,
  type: 'CLARIFICATION' | 'PLAN' | 'HINT' | 'DEBUG' | 'DRY_RUN' | 'OPTIMIZE' | 'SOLUTION' | 'REVIEW' | 'CHAT'
): Promise<void> {
  await AIInteraction.create({
    userId,
    assessmentId,
    problemId,
    message,
    response: response.message,
    type,
    hintLevel: response.level || 0,
    metadata: response.metadata || {},
  });
}

export async function chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId, message } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, message);
    const assessment = await Assessment.findById(assessmentId).populate('problemId');
    
    let response: aiService.AIResponse;
    try {
      response = await aiService.getAIChat(ctx);
    } catch {
      response = aiService.getFallbackResponse('CHAT');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      message, response, 'CHAT'
    );

    // Increment interaction count
    await Assessment.findByIdAndUpdate(assessmentId, { $inc: { aiInteractionCount: 1 } });

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function explain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, 'Explain this problem');
    const assessment = await Assessment.findById(assessmentId).populate('problemId');

    let response: aiService.AIResponse;
    try {
      response = await aiService.getAIExplanation(ctx);
    } catch {
      response = aiService.getFallbackResponse('CLARIFICATION');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      'Explain this problem', response, 'CLARIFICATION'
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function reviewApproach(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId, approach } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, approach);
    const assessment = await Assessment.findById(assessmentId).populate('problemId');

    let response: aiService.AIResponse;
    try {
      response = await aiService.reviewApproach(ctx);
    } catch {
      response = aiService.getFallbackResponse('REVIEW');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      approach || '', response, 'PLAN'
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function hint(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId } = req.body;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw createError('Not found', 404, 'NOT_FOUND');
    if (assessment.userId.toString() !== req.user!.id) throw createError('Forbidden', 403, 'FORBIDDEN');

    const ctx = await buildContext(assessmentId, req.user!.id, 'Give me a hint');

    let response: aiService.AIResponse;
    try {
      response = await aiService.getHint({ ...ctx, hintLevel: assessment.hintLevel });
    } catch {
      response = aiService.getFallbackResponse('HINT');
    }

    // Increment hint level
    const newHintLevel = Math.min(assessment.hintLevel + 1, 6);
    await Assessment.findByIdAndUpdate(assessmentId, {
      $inc: { hintCount: 1 },
      hintLevel: newHintLevel,
    });

    await saveInteraction(
      req.user!.id, assessmentId,
      assessment.problemId.toString(),
      'Hint requested', response, 'HINT'
    );

    res.json({ success: true, data: { ...response, hintLevel: newHintLevel } });
  } catch (err) {
    next(err);
  }
}

export async function debug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId, code, error } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, `Debug my code: ${error || ''}`);
    ctx.studentCode = code || ctx.studentCode;
    const assessment = await Assessment.findById(assessmentId).populate('problemId');

    let response: aiService.AIResponse;
    try {
      response = await aiService.debugCode(ctx);
    } catch {
      response = aiService.getFallbackResponse('DEBUG');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      'Debug request', response, 'DEBUG'
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function dryRun(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId, code } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, 'Dry run my code');
    ctx.studentCode = code || ctx.studentCode;
    const assessment = await Assessment.findById(assessmentId).populate('problemId');

    let response: aiService.AIResponse;
    try {
      response = await aiService.dryRunCode(ctx);
    } catch {
      response = aiService.getFallbackResponse('DRY_RUN');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      'Dry run', response, 'DRY_RUN'
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function optimize(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId, code } = req.body;
    const ctx = await buildContext(assessmentId, req.user!.id, 'Optimize my code');
    ctx.studentCode = code || ctx.studentCode;
    const assessment = await Assessment.findById(assessmentId).populate('problemId');

    let response: aiService.AIResponse;
    try {
      response = await aiService.optimizeCode(ctx);
    } catch {
      response = aiService.getFallbackResponse('OPTIMIZE');
    }

    await saveInteraction(
      req.user!.id, assessmentId,
      (assessment?.problemId as unknown as { _id: string })?._id?.toString() || '',
      'Optimize', response, 'OPTIMIZE'
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw createError('Not found', 404, 'NOT_FOUND');
    if (assessment.userId.toString() !== req.user!.id) throw createError('Forbidden', 403, 'FORBIDDEN');

    const history = await AIInteraction.find({ assessmentId }).sort({ createdAt: 1 });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}
