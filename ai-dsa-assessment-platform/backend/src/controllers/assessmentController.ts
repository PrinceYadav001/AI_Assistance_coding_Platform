import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  startAssessment,
  getAssessmentById,
  saveAssessmentProgress,
  runAssessmentCode,
  submitAssessment,
} from '../services/assessmentService';

export async function start(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const assessment = await startAssessment(req.user!.id, req.body.problemId as string | undefined);
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
}

export async function getAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const assessment = await getAssessmentById(id, req.user!.id);
    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const assessment = await saveAssessmentProgress(id, req.user!.id, req.body as Record<string, unknown>);
    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
}

export async function runCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const { code, input } = req.body as { code: string; input?: string };
    const result = await runAssessmentCode(id, req.user!.id, code, input || '');
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function submit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params['id'] as string;
    const { code, timeComplexity, spaceComplexity } = req.body as { code: string; timeComplexity?: string; spaceComplexity?: string };
    const result = await submitAssessment(
      id,
      req.user!.id,
      code,
      timeComplexity || '',
      spaceComplexity || ''
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
