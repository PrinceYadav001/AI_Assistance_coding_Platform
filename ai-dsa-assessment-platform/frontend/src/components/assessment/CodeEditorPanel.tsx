import { useEffect, Suspense, lazy } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Send, RotateCcw, Lightbulb, Bug, Zap, GitBranch } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Assessment, Problem } from '../../types';
import { assessmentApi, aiApi } from '../../services/apiClient';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useNavigate } from 'react-router-dom';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface Props {
  assessment: Assessment;
  problem: Problem;
}

export default function CodeEditorPanel({ assessment, problem }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const {
    code, setCode,
    timeComplexity, setTimeComplexity,
    spaceComplexity, setSpaceComplexity,
    isRunning, setRunning,
    isSubmitting, setSubmitting,
    setLastRunResults, setActiveTab,
    addAIMessage, setAILoading, setRightPanelTab,
  } = useAssessmentStore();

  useEffect(() => {
    if (!code && assessment.code) {
      setCode(assessment.code);
    } else if (!code && problem.starterCode) {
      setCode(problem.starterCode);
    }
  }, [assessment.code, problem.starterCode]);

  const runMutation = useMutation({
    mutationFn: ({ code: c, input }: { code: string; input: string }) =>
      assessmentApi.runCode(assessment._id, c, input).then((r) => r.data.data),
    onMutate: () => setRunning(true),
    onSuccess: (data) => {
      toast.success('Code executed!');
      setActiveTab('result');
      type RunResult = { result: { status: string; stdout?: string; stderr?: string; executionTime?: number; memoryUsed?: number } };
      const r = (data as RunResult).result;
      setLastRunResults([{
        testId: 'run',
        input: 'Custom',
        expected: '',
        actual: r?.stdout || r?.stderr || 'No output',
        status: r?.status === 'ACCEPTED' ? 'PASSED' : 'ERROR',
        executionTime: r?.executionTime || 0,
        memoryUsed: r?.memoryUsed || 0,
        isHidden: false,
      }]);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Execution failed');
    },
    onSettled: () => setRunning(false),
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      assessmentApi.submit(assessment._id, { code, timeComplexity, spaceComplexity }).then((r) => r.data.data),
    onMutate: () => setSubmitting(true),
    onSuccess: (data) => {
      toast.success('Submitted! Evaluating...');
      qc.invalidateQueries({ queryKey: ['assessment', assessment._id] });
      type SubmitResult = { submission: { _id: string } };
      navigate(`/review/${(data as SubmitResult).submission._id}`);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Submission failed');
    },
    onSettled: () => setSubmitting(false),
  });

  const handleReset = () => {
    if (confirm('Reset code to starter template?')) {
      setCode(problem.starterCode);
      toast.success('Code reset to starter template');
    }
  };

  const handleRunCode = () => {
    if (!code.trim()) { toast.error('Please write some code first'); return; }
    runMutation.mutate({ code, input: problem.examples[0]?.input || '' });
  };

  const handleAIAction = async (action: 'hint' | 'debug' | 'dryRun' | 'optimize') => {
    setAILoading(true);
    setRightPanelTab('ai');
    const userMessages = { hint: 'Give me a hint', debug: 'Help me debug my code', dryRun: 'Do a dry run of my code', optimize: 'Help me optimize my solution' };
    addAIMessage({ id: Date.now().toString(), role: 'user', type: action.toUpperCase(), message: userMessages[action], timestamp: new Date().toISOString() });
    try {
      type AIResponse = { data: { data: { type?: string; message: string; level?: number } } };
      const apiCall: Record<string, () => Promise<AIResponse>> = {
        hint: () => aiApi.hint(assessment._id),
        debug: () => aiApi.debug(assessment._id, code),
        dryRun: () => aiApi.dryRun(assessment._id, code),
        optimize: () => aiApi.optimize(assessment._id, code),
      };
      const res = await apiCall[action]();
      const d = res.data.data;
      addAIMessage({ id: (Date.now() + 1).toString(), role: 'ai', type: d.type || action.toUpperCase(), message: d.message, level: d.level, timestamp: new Date().toISOString() });
    } catch {
      addAIMessage({ id: (Date.now() + 1).toString(), role: 'ai', type: 'ERROR', message: 'AI assistant is temporarily unavailable.', timestamp: new Date().toISOString() });
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-950">
      <div className="flex items-center justify-between px-3 py-2 bg-surface-800 border-b border-surface-600 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted rounded border font-mono" style={{ background: 'var(--color-surface-700)', borderColor: 'var(--color-surface-500)', padding: '2px 8px' }}>Java</span>
          <span className="text-xs text-muted">Main.java</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleReset} className="btn btn-ghost text-xs px-2 py-1" title="Reset code"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleAIAction('hint')} className="btn btn-ghost text-xs px-2 py-1" style={{ color: 'var(--color-warning-400)' }} title="Get hint"><Lightbulb className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleAIAction('debug')} className="btn btn-ghost text-xs px-2 py-1" style={{ color: 'var(--color-error-400)' }} title="Debug"><Bug className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleAIAction('dryRun')} className="btn btn-ghost text-xs px-2 py-1" style={{ color: '#a371f7' }} title="Dry run"><GitBranch className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleAIAction('optimize')} className="btn btn-ghost text-xs px-2 py-1" style={{ color: 'var(--color-success-400)' }} title="Optimize"><Zap className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-surface-950">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted text-xs">Loading editor...</p>
            </div>
          </div>
        }>
          <MonacoEditor
            height="100%"
            language="java"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              lineNumbers: 'on',
              minimap: { enabled: true },
              folding: true,
              bracketPairColorization: { enabled: true },
              autoIndent: 'full',
              formatOnPaste: true,
              suggestOnTriggerCharacters: true,
              tabSize: 4,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              padding: { top: 12 },
            }}
          />
        </Suspense>
      </div>

      <div className="flex-shrink-0 border-t border-surface-600 bg-surface-800 px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-muted text-xs whitespace-nowrap">Time:</span>
              <input value={timeComplexity} onChange={(e) => setTimeComplexity(e.target.value)} placeholder="O(n)" className="w-20 text-xs rounded px-2 py-1 text-white focus:outline-none font-mono" style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-surface-500)' }} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted text-xs whitespace-nowrap">Space:</span>
              <input value={spaceComplexity} onChange={(e) => setSpaceComplexity(e.target.value)} placeholder="O(1)" className="w-20 text-xs rounded px-2 py-1 text-white focus:outline-none font-mono" style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-surface-500)' }} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRunCode} disabled={isRunning} className="btn btn-secondary text-xs px-3 py-1.5">
              {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button onClick={() => submitMutation.mutate()} disabled={isSubmitting} className="btn btn-success text-xs px-3 py-1.5">
              {isSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
