import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Lightbulb, Zap, Home, BookOpen } from 'lucide-react';
import { submissionsApi, assessmentApi } from '../services/apiClient';
import { useMutation } from '@tanstack/react-query';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import type { Submission, EvaluationResult } from '../types';
import clsx from 'clsx';

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (pct / 100) * circumference;
  const color = score >= 8 ? '#3fb950' : score >= 6 ? '#388bfd' : score >= 4 ? '#d29922' : '#f85149';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#21262d" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-muted text-xs">/10</span>
      </div>
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: string }) {
  const config: Record<string, { cls: string; emoji: string }> = {
    'Excellent': { cls: 'text-success-400 bg-success-600/15 border-success-600/30', emoji: '🏆' },
    'Good': { cls: 'text-accent-400 bg-accent-600/15 border-accent-600/30', emoji: '⭐' },
    'Average': { cls: 'text-warning-400 bg-warning-500/15 border-warning-500/30', emoji: '📈' },
    'Below Average': { cls: 'text-error-400 bg-error-500/15 border-error-500/30', emoji: '📚' },
    'Poor': { cls: 'text-error-400 bg-error-500/15 border-error-500/30', emoji: '💪' },
  };
  const c = config[classification] || { cls: 'text-muted bg-surface-600 border-surface-500', emoji: '📊' };
  return (
    <span className={clsx('text-sm px-3 py-1 rounded-full border font-medium', c.cls)}>
      {c.emoji} {classification}
    </span>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionsApi.getById(id!).then((r) => r.data.data as Submission),
    enabled: !!id,
  });

  const startNewMutation = useMutation({
    mutationFn: () => assessmentApi.start(),
    onSuccess: (res) => navigate(`/assessment/${res.data.data._id}`),
    onError: () => toast.error('Failed to start new assessment'),
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 flex justify-center items-center min-h-64">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!submission) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-muted mb-4">Review data not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
      </MainLayout>
    );
  }

  const eval_ = submission.evaluation as EvaluationResult;
  const prob = submission.problemId as { title: string; difficulty: string; topic: string };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Result Header Card */}
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <ScoreRing score={submission.score} />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Assessment Complete!</h1>
              {eval_?.classification && <ClassificationBadge classification={eval_.classification} />}
            </div>
            <div className="flex gap-3 mt-2">
              <div className="px-4 py-2 bg-surface-700 rounded-lg text-center">
                <div className="text-xl font-bold text-success-400">{submission.visiblePassed}/{submission.visibleTotal}</div>
                <div className="text-xs text-muted">Visible</div>
              </div>
              {submission.hiddenTotal > 0 && (
                <div className="px-4 py-2 bg-surface-700 rounded-lg text-center">
                  <div className="text-xl font-bold text-accent-400">{submission.hiddenPassed || 0}/{submission.hiddenTotal}</div>
                  <div className="text-xs text-muted">Hidden</div>
                </div>
              )}
              <div className="px-4 py-2 bg-surface-700 rounded-lg text-center">
                <div className="text-xl font-bold text-white">{prob?.difficulty}</div>
                <div className="text-xs text-muted">Difficulty</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {eval_?.aiAnalysis && (
          <div className="card p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-400" />
              AI Evaluation
            </h3>
            <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{eval_.aiAnalysis}</p>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eval_?.strengths?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-success-400 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> What you did well
              </h3>
              <ul className="space-y-2">
                {eval_.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-success-400 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {eval_?.weaknesses?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-error-400 font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Areas to improve
              </h3>
              <ul className="space-y-2">
                {eval_.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="text-error-400 mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {eval_?.recommendations?.length > 0 && (
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning-400" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {eval_.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-warning-400 mt-0.5">→</span> {r}
                </li>
              ))}
            </ul>
            {eval_?.nextProblemSuggestion && (
              <div className="mt-4 p-3 bg-accent-600/10 border border-accent-600/20 rounded-lg">
                <p className="text-xs text-accent-400 font-medium mb-1">Next Problem Suggestion</p>
                <p className="text-sm text-white/80">{eval_.nextProblemSuggestion}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate(`/submissions/${id}`)} className="btn-secondary">
            <BookOpen className="w-4 h-4" />
            View Submission Details
          </button>
          <button
            onClick={() => startNewMutation.mutate()}
            disabled={startNewMutation.isPending}
            className="btn-primary"
          >
            <Zap className="w-4 h-4" />
            New Assessment
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost">
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
