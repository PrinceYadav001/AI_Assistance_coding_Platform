import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { submissionsApi } from '../services/apiClient';
import MainLayout from '../layouts/MainLayout';
import type { Submission } from '../types';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    ACCEPTED: 'text-success-400 bg-success-600/10 border-success-600/20',
    PARTIALLY_CORRECT: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
    WRONG_ANSWER: 'text-error-400 bg-error-500/10 border-error-500/20',
    COMPILE_ERROR: 'text-error-400 bg-error-500/10 border-error-500/20',
    TIMEOUT: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  };
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded border font-medium', config[status] || 'text-muted bg-surface-600 border-surface-500')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const classes: Record<string, string> = {
    Easy: 'badge-easy', Moderate: 'badge-moderate', Hard: 'badge-hard', Expert: 'badge bg-purple-500/20 text-purple-400 border border-purple-500/30'
  };
  return <span className={classes[difficulty] || 'badge'}>{difficulty}</span>;
}

export default function SubmissionsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => submissionsApi.getAll().then((r) => r.data.data),
  });

  const submissions: Submission[] = data?.submissions || [];

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Submissions</h1>
          <p className="text-muted text-sm mt-1">Your assessment history</p>
        </div>

        <div className="card overflow-hidden">
          <div className="card-header">
            <FileText className="w-4 h-4 text-accent-400" />
            All Submissions ({submissions.length})
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submissions.length > 0 ? (
            <div className="divide-y divide-surface-600">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide bg-surface-900/50">
                <span className="col-span-4">Problem</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-2">Difficulty</span>
                <span className="col-span-1 text-center">Score</span>
                <span className="col-span-2 text-center">Tests</span>
                <span className="col-span-1 text-right">When</span>
              </div>

              {submissions.map((sub) => {
                const prob = sub.problemId as { title: string; difficulty: string; slug: string };
                return (
                  <div
                    key={sub._id}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-surface-700/30 cursor-pointer group transition-colors"
                    onClick={() => navigate(`/submissions/${sub._id}`)}
                  >
                    <div className="col-span-4">
                      <p className="text-white text-sm font-medium group-hover:text-accent-400 transition-colors truncate">{prob?.title}</p>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={sub.status} />
                    </div>
                    <div className="col-span-2">
                      <DifficultyBadge difficulty={prob?.difficulty} />
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-white font-bold text-sm">{sub.score}</span>
                      <span className="text-muted text-xs">/10</span>
                    </div>
                    <div className="col-span-2 text-center text-xs text-muted">
                      {sub.visiblePassed}/{sub.visibleTotal} visible
                    </div>
                    <div className="col-span-1 text-right text-xs text-muted">
                      {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No submissions yet. Start an assessment!</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
