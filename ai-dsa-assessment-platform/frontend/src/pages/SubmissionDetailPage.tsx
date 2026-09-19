import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, Code2 } from 'lucide-react';
import { submissionsApi } from '../services/apiClient';
import MainLayout from '../layouts/MainLayout';
import type { Submission, TestResult } from '../types';
import clsx from 'clsx';

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionsApi.getById(id!).then((r) => r.data.data as Submission),
    enabled: !!id,
  });

  if (isLoading) {
    return <MainLayout><div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div></MainLayout>;
  }

  if (!data) return <MainLayout><div className="p-6 text-muted">Submission not found</div></MainLayout>;

  const prob = data.problemId as { title: string; difficulty: string; topic: string };

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/submissions')} className="btn-ghost p-2 mt-1">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{prob?.title}</h1>
            <p className="text-muted text-sm">{prob?.topic} • {prob?.difficulty}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-white">{data.score}<span className="text-muted text-lg">/10</span></div>
            <p className="text-sm text-muted">{data.status.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Visible Tests', value: `${data.visiblePassed}/${data.visibleTotal}`, color: 'success' },
            { label: 'Hidden Tests', value: `${data.hiddenPassed || '?'}/${data.hiddenTotal || '?'}`, color: 'accent' },
            { label: 'Time Complexity', value: data.timeComplexity || '—', color: 'warning' },
            { label: 'Space Complexity', value: data.spaceComplexity || '—', color: 'warning' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-muted text-xs uppercase tracking-wide">{s.label}</p>
              <p className="text-white font-bold text-lg mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        {data.evaluation?.aiAnalysis && (
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">AI Evaluation</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Correctness', value: data.evaluation.correctness },
                { label: 'Code Quality', value: data.evaluation.codeQualityScore },
                { label: 'Edge Cases', value: data.evaluation.edgeCasesScore },
              ].map((m) => (
                <div key={m.label} className="bg-surface-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{m.value || '—'}</div>
                  <div className="text-muted text-xs mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm whitespace-pre-wrap">{data.evaluation.aiAnalysis}</p>
          </div>
        )}

        {/* Code */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <Code2 className="w-4 h-4 text-accent-400" />
            Submitted Code (Java)
          </div>
          <div className="relative">
            <pre className="p-4 text-sm font-mono text-white/80 bg-surface-950 overflow-x-auto max-h-96 scrollbar-thin">{data.code}</pre>
          </div>
        </div>

        {/* Test Results */}
        {data.testResults && data.testResults.length > 0 && (
          <div className="card overflow-hidden">
            <div className="card-header">
              Test Results ({data.testResults.filter((t: TestResult) => t.status === 'PASSED').length}/{data.testResults.length} passed)
            </div>
            <div className="divide-y divide-surface-600 max-h-96 overflow-y-auto scrollbar-thin">
              {data.testResults.map((tr: TestResult, i: number) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  {tr.status === 'PASSED' ? (
                    <CheckCircle2 className="w-4 h-4 text-success-400 flex-shrink-0" />
                  ) : tr.status === 'ERROR' ? (
                    <AlertCircle className="w-4 h-4 text-warning-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-muted mb-0.5">Input</p>
                      <code className="text-white/80 font-mono">{tr.isHidden ? '[hidden]' : tr.input?.slice(0, 40)}</code>
                    </div>
                    <div>
                      <p className="text-muted mb-0.5">Expected</p>
                      <code className="text-success-400 font-mono">{tr.isHidden ? '[hidden]' : tr.expected?.slice(0, 40)}</code>
                    </div>
                    <div>
                      <p className="text-muted mb-0.5">Got</p>
                      <code className={clsx('font-mono', tr.status === 'PASSED' ? 'text-success-400' : 'text-error-400')}>
                        {tr.actual?.slice(0, 40)}
                      </code>
                    </div>
                  </div>
                  <span className="text-muted text-xs ml-auto flex-shrink-0">{tr.executionTime}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
