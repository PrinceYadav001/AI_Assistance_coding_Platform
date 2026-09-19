import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Problem } from '../models/Problem';
import { createError } from '../middleware/errorHandler';

export async function getProblems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      difficulty,
      topic,
      search,
      sort = 'createdAt',
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = { isPublished: true };
    if (difficulty) query.difficulty = difficulty;
    if (topic) query.topic = topic;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('-hiddenTestCases -solution -bruteForceApproach -optimalApproach -explanation')
        .sort({ [sort]: -1 })
        .skip(skip)
        .limit(limitNum),
      Problem.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProblemById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const problem = await Problem.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isPublished: true,
    }).select('-hiddenTestCases -solution -bruteForceApproach -optimalApproach');

    if (!problem) throw createError('Problem not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

export async function createProblem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

export async function updateProblem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) throw createError('Problem not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}

export async function deleteProblem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) throw createError('Problem not found', 404, 'NOT_FOUND');
    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getProblemAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) throw createError('Problem not found', 404, 'NOT_FOUND');
    res.json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
}
