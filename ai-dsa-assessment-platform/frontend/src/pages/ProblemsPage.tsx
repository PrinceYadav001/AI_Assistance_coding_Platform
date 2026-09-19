import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Code2, Zap } from 'lucide-react';
import { problemsApi, assessmentApi } from '../services/apiClient';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import type { Problem } from '../types';
import { TOPICS } from '../types';
import clsx from 'clsx';

const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Hard', 'Expert'];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const classes = { Easy: 'badge-easy', Moderate: 'badge-moderate', Hard: 'badge-hard', Expert: 'badge bg-purple-500/20 text-purple-400 border border-purple-500/30' };
  return <span className={classes[difficulty as keyof typeof classes] || 'badge'}>{difficulty}</span>;
}

export default function ProblemsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['problems', { search, difficulty, topic, page }],
    queryFn: () => {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search) params.search = search;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (topic !== 'All') params.topic = topic;
      return problemsApi.getAll(params).then((r) => r.data.data);
    },
  });

  const startMutation = useMutation({
    mutationFn: (problemId: string) => assessmentApi.start(problemId),
    onSuccess: (res) => navigate(`/assessment/${res.data.data._id}`),
    onError: () => toast.error('Failed to start assessment'),
  });

  const problems: Problem[] = data?.problems || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Problem Bank</h1>
            <p className="text-muted text-sm mt-1">{pagination.total} problems available</p>
          </div>
          <button
            onClick={() => startMutation.mutate('')}
            disabled={startMutation.isPending}
            className="btn-primary"
          >
            <Zap className="w-4 h-4" />
            Start Random
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search problems..."
                className="input pl-9 text-sm"
              />
            </div>

            {/* Difficulty filter */}
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="input w-36"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Topic filter */}
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="input w-44"
            >
              <option value="All">All Topics</option>
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Problems Table */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <Code2 className="w-4 h-4 text-accent-400" />
            Problems ({problems.length})
          </div>

          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="divide-y divide-surface-600">
                {/* Table header */}
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted uppercase tracking-wide bg-surface-900/50">
                  <span className="col-span-5">Problem</span>
                  <span className="col-span-2">Difficulty</span>
                  <span className="col-span-2">Topic</span>
                  <span className="col-span-2 text-center">Companies</span>
                  <span className="col-span-1"></span>
                </div>

                {problems.map((problem) => (
                  <div
                    key={problem._id}
                    className="grid grid-cols-12 items-center px-4 py-3 hover:bg-surface-700/30 cursor-pointer transition-colors group"
                    onClick={() => startMutation.mutate(problem._id)}
                  >
                    <div className="col-span-5">
                      <p className="text-white text-sm font-medium group-hover:text-accent-400 transition-colors">{problem.title}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {problem.patterns.slice(0, 2).map((p) => (
                          <span key={p} className="text-xs px-1.5 py-0.5 bg-surface-600 text-muted rounded">{p}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-muted">{problem.topic}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {problem.companies?.slice(0, 2).map((c) => (
                          <span key={c} className="text-xs px-1.5 py-0.5 bg-accent-600/10 text-accent-400 rounded border border-accent-600/20">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Play className="w-4 h-4 text-muted group-hover:text-accent-400 transition-colors" />
                    </div>
                  </div>
                ))}

                {problems.length === 0 && (
                  <div className="py-12 text-center text-muted">
                    <Code2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p>No problems found matching your filters</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-surface-600">
                  {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={clsx(
                        'w-8 h-8 rounded-md text-sm transition-colors',
                        page === p ? 'bg-accent-600 text-white' : 'text-muted hover:text-white hover:bg-surface-700'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
