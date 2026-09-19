import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, CheckCircle2, XCircle, AlertCircle, Clock, Terminal } from 'lucide-react';
import type { Assessment, Problem, TestResult } from '../../types';
import { assessmentApi } from '../../services/apiClient';
import { useAssessmentStore } from '../../store/assessmentStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Props {
  assessment: Assessment;
  problem: Problem;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'PASSED': return <CheckCircle2 className="w-4 h-4 text-success-400" />;
    case 'FAILED': return <XCircle className="w-4 h-4 text-error-400" />;
    case 'ERROR': return <AlertCircle className="w-4 h-4 text-warning-400" />;
    case 'TIMEOUT': return <Clock className="w-4 h-4 text-orange-400" />;
    default: return <AlertCircle className="w-4 h-4 text-muted" />;
  }
}

export default function TestPanel({ assessment, problem }: Props) {
  const { activeTab, setActiveTab, customInput, setCustomInput, lastRunResults, code } = useAssessmentStore();
  const [customExpected, setCustomExpected] = useState('');

  const runCustomMutation = useMutation({
    mutationFn: () => assessmentApi.runCode(assessment._id, code, customInput).then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Custom test executed!');
    },
    onError: () => toast.error('Execution failed'),
  });

  const visibleTests = problem.visibleTestCases || [];

  return (
    <div className="h-full flex flex-col bg-surface-800">
      {/* Tab headers */}
      <div className="flex border-b border-surface-600 flex-shrink-0 bg-surface-900">
        {(['sample', 'custom', 'result'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 text-xs font-medium transition-colors',
              activeTab === tab
                ? 'text-accent-400 border-b-2 border-accent-400 bg-accent-600/5'
                : 'text-muted hover:text-white hover:bg-surface-700'
            )}
          >
            {tab === 'sample' ? `Sample Tests (${visibleTests.length})` : tab === 'custom' ? 'Custom Test' : 'Execution Result'}
          </button>
        ))}
        <div className="ml-auto flex items-center px-3">
          <Terminal className="w-3.5 h-3.5 text-muted" />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {/* Sample Tests */}
        {activeTab === 'sample' && (
          <div className="space-y-3">
            {visibleTests.map((tc, i) => (
              <div key={i} className="border border-surface-500 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between bg-surface-700 px-3 py-1.5">
                  <span className="text-xs font-medium text-white">Test Case #{i + 1}</span>
                  {tc.description && <span className="text-xs text-muted">{tc.category}</span>}
                </div>
                <div className="p-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted mb-1">Input:</p>
                    <pre className="text-xs font-mono text-accent-300 bg-surface-900 rounded p-2 overflow-x-auto">{tc.input || '(empty)'}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1">Expected Output:</p>
                    <pre className="text-xs font-mono text-success-400 bg-surface-900 rounded p-2 overflow-x-auto">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
            {visibleTests.length === 0 && (
              <p className="text-center text-muted text-sm py-8">No visible test cases</p>
            )}
          </div>
        )}

        {/* Custom Test */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted font-medium mb-1.5 block">Custom Input:</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your test input here..."
                className="w-full h-24 text-xs font-mono bg-surface-700 border border-surface-500 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-accent-500 placeholder-muted"
              />
            </div>
            <div>
              <label className="text-xs text-muted font-medium mb-1.5 block">Expected Output (optional):</label>
              <input
                value={customExpected}
                onChange={(e) => setCustomExpected(e.target.value)}
                placeholder="Expected output..."
                className="input text-xs font-mono"
              />
            </div>
            <button
              onClick={() => runCustomMutation.mutate()}
              disabled={runCustomMutation.isPending || !customInput.trim()}
              className="btn-secondary text-xs"
            >
              {runCustomMutation.isPending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Play className="w-3.5 h-3.5" />}
              Run Custom Test
            </button>
          </div>
        )}

        {/* Execution Results */}
        {activeTab === 'result' && (
          <div className="space-y-3">
            {lastRunResults && lastRunResults.length > 0 ? (
              lastRunResults.map((result: TestResult, i) => (
                <div key={i} className="border border-surface-500 rounded-lg overflow-hidden">
                  <div className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 text-xs',
                    result.status === 'PASSED' ? 'bg-success-600/10 border-b border-success-600/20' :
                    result.status === 'FAILED' ? 'bg-error-500/10 border-b border-error-500/20' :
                    'bg-warning-500/10 border-b border-warning-500/20'
                  )}>
                    <StatusIcon status={result.status} />
                    <span className={clsx(
                      'font-medium',
                      result.status === 'PASSED' ? 'text-success-400' : result.status === 'FAILED' ? 'text-error-400' : 'text-warning-400'
                    )}>
                      {result.status}
                    </span>
                    <span className="ml-auto text-muted">{result.executionTime > 0 ? `${result.executionTime}ms` : ''}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      {!result.isHidden && result.input && (
                        <div>
                          <p className="text-xs text-muted mb-1">Input:</p>
                          <pre className="text-xs font-mono text-white/80 bg-surface-900 rounded p-2 overflow-x-auto max-h-20">{result.input}</pre>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted mb-1">Output:</p>
                        <pre className="text-xs font-mono text-accent-300 bg-surface-900 rounded p-2 overflow-x-auto max-h-20">{result.actual}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted">
                <Play className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">Run your code to see results here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
