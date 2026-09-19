import { Assessment, IAssessment } from '../models/Assessment';
import { Problem, IProblem } from '../models/Problem';
import { User } from '../models/User';
import { Submission } from '../models/Submission';
import { Progress } from '../models/Progress';
import { runTestCases } from './executionService';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

const ASSESSMENT_DURATION_MINUTES = 30;

export async function startAssessment(userId: string, problemId?: string): Promise<IAssessment> {
  // Check for active assessment
  const existing = await Assessment.findOne({
    userId,
    status: 'IN_PROGRESS',
  });
  if (existing) {
    return existing;
  }

  // Select problem
  let problem: IProblem | null;
  if (problemId) {
    problem = await Problem.findById(problemId);
  } else {
    problem = await selectAdaptiveProblem(userId);
  }

  if (!problem) {
    throw createError('No suitable problem found', 404, 'NO_PROBLEM_AVAILABLE');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ASSESSMENT_DURATION_MINUTES * 60 * 1000);

  const assessment = await Assessment.create({
    userId,
    problemId: problem._id,
    status: 'IN_PROGRESS',
    startedAt: now,
    expiresAt,
    code: problem.starterCode,
    language: 'java',
  });

  return assessment;
}

async function selectAdaptiveProblem(userId: string): Promise<IProblem | null> {
  const user = await User.findById(userId);
  const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(10);

  // Get solved problem IDs to avoid repeats
  const solvedIds = submissions.map((s) => s.problemId.toString());

  // Determine target difficulty
  let targetDifficulty: string = 'Moderate';
  if (submissions.length > 0) {
    const recentScores = submissions.slice(0, 5).map((s) => s.score);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (avgScore >= 8) targetDifficulty = 'Hard';
    else if (avgScore >= 6) targetDifficulty = 'Moderate';
    else targetDifficulty = 'Easy';
  }

  // Find problem not recently solved
  const query: Record<string, unknown> = {
    isPublished: true,
    difficulty: targetDifficulty,
    _id: { $nin: solvedIds.map((id) => new mongoose.Types.ObjectId(id)) },
  };

  // Optionally bias toward weak topics
  if (user?.topicStats) {
    const weakTopic = Object.entries(user.topicStats)
      .filter(([, stats]) => stats.attempted > 0 && stats.solved / stats.attempted < 0.5)
      .sort(([, a], [, b]) => (a.solved / a.attempted) - (b.solved / b.attempted))[0];

    if (weakTopic) {
      query.topic = weakTopic[0];
    }
  }

  let problem = await Problem.findOne(query);
  if (!problem) {
    // Fallback: any published problem not recently solved
    problem = await Problem.findOne({
      isPublished: true,
      _id: { $nin: solvedIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  }
  if (!problem) {
    // Final fallback: first published problem
    problem = await Problem.findOne({ isPublished: true });
  }

  return problem;
}

export async function getAssessmentById(assessmentId: string, userId: string): Promise<IAssessment> {
  const assessment = await Assessment.findById(assessmentId).populate('problemId');
  if (!assessment) {
    throw createError('Assessment not found', 404, 'ASSESSMENT_NOT_FOUND');
  }
  if (assessment.userId.toString() !== userId) {
    throw createError('Access denied', 403, 'FORBIDDEN');
  }

  // Auto-expire
  if (assessment.status === 'IN_PROGRESS' && new Date() > assessment.expiresAt) {
    assessment.status = 'EXPIRED';
    await assessment.save();
  }

  return assessment;
}

export async function saveAssessmentProgress(
  assessmentId: string,
  userId: string,
  updates: Partial<{
    code: string;
    approach: string;
    dataStructure: string;
    timeComplexity: string;
    spaceComplexity: string;
    currentStep: string;
  }>
): Promise<IAssessment> {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw createError('Assessment not found', 404, 'NOT_FOUND');
  if (assessment.userId.toString() !== userId) throw createError('Forbidden', 403, 'FORBIDDEN');
  if (assessment.status !== 'IN_PROGRESS') throw createError('Assessment not active', 400, 'INVALID_STATUS');
  if (new Date() > assessment.expiresAt) {
    assessment.status = 'EXPIRED';
    await assessment.save();
    throw createError('Assessment expired', 400, 'ASSESSMENT_EXPIRED');
  }

  Object.assign(assessment, updates);
  await assessment.save();
  return assessment;
}

export async function runAssessmentCode(
  assessmentId: string,
  userId: string,
  code: string,
  input: string
): Promise<{ result: unknown }> {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw createError('Assessment not found', 404, 'NOT_FOUND');
  if (assessment.userId.toString() !== userId) throw createError('Forbidden', 403, 'FORBIDDEN');
  if (assessment.status !== 'IN_PROGRESS') throw createError('Assessment not active', 400, 'INVALID_STATUS');
  if (new Date() > assessment.expiresAt) throw createError('Assessment expired', 400, 'EXPIRED');

  const { executeCode } = await import('./executionService');
  const result = await executeCode({ code, language: assessment.language, input });

  // Save code
  assessment.code = code;
  await assessment.save();

  return { result };
}

export async function submitAssessment(
  assessmentId: string,
  userId: string,
  code: string,
  timeComplexity: string,
  spaceComplexity: string
): Promise<{ submission: InstanceType<typeof Submission>; evaluation: unknown }> {
  const assessment = await Assessment.findById(assessmentId).populate<{ problemId: IProblem }>('problemId');
  if (!assessment) throw createError('Assessment not found', 404, 'NOT_FOUND');
  if (assessment.userId.toString() !== userId) throw createError('Forbidden', 403, 'FORBIDDEN');
  if (assessment.status !== 'IN_PROGRESS') throw createError('Assessment not active', 400, 'INVALID_STATUS');
  if (new Date() > assessment.expiresAt) throw createError('Assessment expired', 400, 'EXPIRED');

  const problem = assessment.problemId as IProblem;

  // Run visible tests
  const visibleResults = await runTestCases(
    code, 'java',
    problem.visibleTestCases,
    false,
    problem.timeLimit,
    problem.memoryLimit
  );

  // Run hidden tests
  const hiddenResults = await runTestCases(
    code, 'java',
    problem.hiddenTestCases,
    true,
    problem.timeLimit,
    problem.memoryLimit
  );

  const allResults = [...visibleResults, ...hiddenResults];
  const visiblePassed = visibleResults.filter((r) => r.status === 'PASSED').length;
  const hiddenPassed = hiddenResults.filter((r) => r.status === 'PASSED').length;

  // Determine overall status
  const hasCompileError = allResults.some((r) => r.status === 'ERROR' && !r.actual.includes('wrong'));
  const hasTLE = allResults.some((r) => r.status === 'TIMEOUT');
  const allPassed = allResults.every((r) => r.status === 'PASSED');
  const partiallyCorrect = !allPassed && (visiblePassed + hiddenPassed) > 0;

  let status: 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'ACCEPTED' | 'PARTIALLY_CORRECT' | 'RUNTIME_ERROR' = 'WRONG_ANSWER';
  if (hasCompileError) status = 'COMPILE_ERROR';
  else if (hasTLE) status = 'TIME_LIMIT_EXCEEDED';
  else if (allPassed) status = 'ACCEPTED';
  else if (partiallyCorrect) status = 'PARTIALLY_CORRECT';

  // Score calculation
  const correctnessRatio = (visiblePassed + hiddenPassed) / Math.max(1, visibleResults.length + hiddenResults.length);
  const correctnessScore = Math.round(correctnessRatio * 4);
  
  const timeCxScore = evaluateComplexity(timeComplexity, problem.optimalApproach) ? 2 : 1;
  const spaceCxScore = evaluateComplexity(spaceComplexity, problem.optimalApproach) ? 1 : 0;
  const edgeCasesScore = hiddenPassed >= Math.floor(hiddenResults.length * 0.8) ? 1 : 0;
  const codeQualityScore = evaluateCodeQuality(code);
  const reasoningScore = assessment.approach && assessment.dataStructure ? 1 : 0;

  const totalScore = correctnessScore + timeCxScore + spaceCxScore + edgeCasesScore + codeQualityScore + reasoningScore;

  const classification =
    status === 'ACCEPTED' && timeCxScore === 2
      ? 'Accepted'
      : status === 'ACCEPTED'
      ? 'Accepted but inefficient'
      : status === 'PARTIALLY_CORRECT'
      ? 'Partially correct'
      : status === 'COMPILE_ERROR'
      ? 'Compilation Error'
      : status === 'TIME_LIMIT_EXCEEDED'
      ? 'Time Limit Exceeded'
      : 'Wrong Answer';

  const evaluation = {
    correctness: correctnessScore,
    timeComplexityScore: timeCxScore,
    spaceComplexityScore: spaceCxScore,
    edgeCasesScore,
    codeQualityScore,
    reasoningScore,
    totalScore,
    classification,
    strengths: buildStrengths(correctnessScore, timeCxScore, spaceCxScore, codeQualityScore),
    weaknesses: buildWeaknesses(correctnessScore, timeCxScore, spaceCxScore, codeQualityScore),
    commonMistakes: [],
    recommendations: [`Study ${problem.topic} patterns`, 'Practice edge cases'],
    nextProblemSuggestion: problem.topic,
    aiAnalysis: `Your solution achieved ${visiblePassed}/${visibleResults.length} visible tests and ${hiddenPassed}/${hiddenResults.length} hidden tests.`,
  };

  const submission = await Submission.create({
    userId,
    problemId: problem._id,
    assessmentId,
    code,
    language: 'java',
    status,
    testResults: allResults,
    visiblePassed,
    visibleTotal: visibleResults.length,
    hiddenPassed,
    hiddenTotal: hiddenResults.length,
    timeComplexity,
    spaceComplexity,
    score: totalScore,
    evaluation,
    submittedAt: new Date(),
    executionTime: Math.max(...allResults.map((r) => r.executionTime || 0)),
    memoryUsed: Math.max(...allResults.map((r) => r.memoryUsed || 0)),
    compilerOutput: '',
  });

  // Update assessment
  assessment.status = 'SUBMITTED';
  assessment.submittedAt = new Date();
  assessment.code = code;
  assessment.timeComplexity = timeComplexity;
  assessment.spaceComplexity = spaceComplexity;
  assessment.testResults = allResults;
  assessment.score = totalScore;
  assessment.evaluation = evaluation;
  await assessment.save();

  // Update user stats
  await updateUserProgress(userId, problem, totalScore, status);

  return { submission, evaluation };
}

function evaluateComplexity(claimed: string, approach: string): boolean {
  // Simplified: give credit if student claimed something
  return !!claimed && claimed.toLowerCase().includes('o(');
}

function evaluateCodeQuality(code: string): number {
  let score = 1;
  if (code.includes('// TODO') || code.length < 50) score = 0;
  return score;
}

function buildStrengths(correctness: number, time: number, space: number, quality: number): string[] {
  const strengths: string[] = [];
  if (correctness >= 3) strengths.push('Good problem-solving approach');
  if (time === 2) strengths.push('Optimal time complexity');
  if (space === 1) strengths.push('Efficient memory usage');
  if (quality === 1) strengths.push('Clean code structure');
  return strengths.length > 0 ? strengths : ['Attempted the problem'];
}

function buildWeaknesses(correctness: number, time: number, space: number, quality: number): string[] {
  const weaknesses: string[] = [];
  if (correctness < 3) weaknesses.push('Correctness needs improvement');
  if (time < 2) weaknesses.push('Time complexity can be optimized');
  if (space < 1) weaknesses.push('Space complexity can be improved');
  if (quality < 1) weaknesses.push('Code quality and readability');
  return weaknesses;
}

async function updateUserProgress(
  userId: string,
  problem: IProblem,
  score: number,
  status: string
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  user.attemptedProblems += 1;
  user.totalTime += 1800; // 30 min default

  if (status === 'ACCEPTED') {
    user.solvedProblems += 1;
    user.acceptedProblems += 1;
    user.currentStreak += 1;
  } else {
    user.currentStreak = 0;
  }

  // Update topic stats
  const topicStats = user.topicStats || {};
  if (!topicStats[problem.topic]) {
    topicStats[problem.topic] = { attempted: 0, solved: 0, avgScore: 0 };
  }
  topicStats[problem.topic].attempted += 1;
  if (status === 'ACCEPTED') topicStats[problem.topic].solved += 1;
  topicStats[problem.topic].avgScore =
    (topicStats[problem.topic].avgScore + score) / 2;
  user.topicStats = topicStats;

  // Update difficulty stats
  const difficultyStats = user.difficultyStats || {};
  if (!difficultyStats[problem.difficulty]) {
    difficultyStats[problem.difficulty] = { attempted: 0, solved: 0, avgScore: 0 };
  }
  difficultyStats[problem.difficulty].attempted += 1;
  if (status === 'ACCEPTED') difficultyStats[problem.difficulty].solved += 1;
  difficultyStats[problem.difficulty].avgScore =
    (difficultyStats[problem.difficulty].avgScore + score) / 2;
  user.difficultyStats = difficultyStats;

  const allSubmissions = await Submission.find({ userId });
  user.averageScore = allSubmissions.length > 0
    ? allSubmissions.reduce((sum, s) => sum + s.score, 0) / allSubmissions.length
    : 0;

  user.markModified('topicStats');
  user.markModified('difficultyStats');
  await user.save();
}
