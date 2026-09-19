import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Submission } from '../models/Submission';
import { Assessment } from '../models/Assessment';

export async function getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select('-passwordHash');

    const recentSubmissions = await Submission.find({ userId })
      .populate('problemId', 'title slug difficulty topic')
      .sort({ createdAt: -1 })
      .limit(5);

    const activeAssessment = await Assessment.findOne({ userId, status: 'IN_PROGRESS' }).populate('problemId', 'title slug difficulty topic');

    // Calculate weekly activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklySubmissions = await Submission.aggregate([
      { $match: { userId: user!._id, createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Score history
    const scoreHistory = await Submission.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('score createdAt status');

    res.json({
      success: true,
      data: {
        user,
        stats: {
          problemsSolved: user!.solvedProblems,
          problemsAttempted: user!.attemptedProblems,
          acceptanceRate: user!.attemptedProblems > 0
            ? Math.round((user!.acceptedProblems / user!.attemptedProblems) * 100)
            : 0,
          averageScore: Math.round(user!.averageScore * 10) / 10,
          currentStreak: user!.currentStreak,
          totalTime: user!.totalTime,
          topicStats: user!.topicStats,
          difficultyStats: user!.difficultyStats,
        },
        recentSubmissions,
        weeklyActivity: weeklySubmissions,
        scoreHistory,
        activeAssessment,
      },
    });
  } catch (err) {
    next(err);
  }
}
