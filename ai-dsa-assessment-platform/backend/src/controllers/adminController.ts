import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import { Assessment } from '../models/Assessment';

export async function getAdminStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalUsers, totalProblems, totalSubmissions, activeAssessments, avgScore] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Assessment.countDocuments({ status: 'IN_PROGRESS' }),
      Submission.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]),
    ]);

    const acceptedSubmissions = await Submission.countDocuments({ status: 'ACCEPTED' });
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        activeAssessments,
        acceptanceRate,
        averageScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg * 10) / 10 : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find().select('-passwordHash').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    res.json({ success: true, data: { users, pagination: { page: pageNum, limit: limitNum, total } } });
  } catch (err) {
    next(err);
  }
}

export async function getAdminProblems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [problems, total] = await Promise.all([
      Problem.find().select('-hiddenTestCases').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Problem.countDocuments(),
    ]);

    res.json({ success: true, data: { problems, pagination: { page: pageNum, limit: limitNum, total } } });
  } catch (err) {
    next(err);
  }
}

export async function getAdminSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find()
        .populate('userId', 'name email')
        .populate('problemId', 'title difficulty')
        .select('-testResults -code')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Submission.countDocuments(),
    ]);

    res.json({ success: true, data: { submissions, pagination: { page: pageNum, limit: limitNum, total } } });
  } catch (err) {
    next(err);
  }
}
