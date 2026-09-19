import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Submission } from '../models/Submission';
import { createError } from '../middleware/errorHandler';

export async function getSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find({ userId: req.user!.id })
        .populate('problemId', 'title slug difficulty topic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-testResults'),
      Submission.countDocuments({ userId: req.user!.id }),
    ]);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubmissionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title slug difficulty topic patterns')
      .populate('assessmentId');

    if (!submission) throw createError('Submission not found', 404, 'NOT_FOUND');
    if (submission.userId.toString() !== req.user!.id) throw createError('Forbidden', 403, 'FORBIDDEN');

    // Filter hidden test results
    const safeResults = submission.testResults?.map((r: Record<string, unknown>) => ({
      ...r,
      input: r.isHidden ? '[hidden]' : r.input,
      expected: r.isHidden ? '[hidden]' : r.expected,
      actual: r.isHidden ? (r.status === 'PASSED' ? '[passed]' : '[failed]') : r.actual,
    }));

    res.json({ success: true, data: { ...submission.toObject(), testResults: safeResults } });
  } catch (err) {
    next(err);
  }
}
