import { useState } from 'react';
import type { Problem, Assessment } from '../../types';
import { BookOpen, ChevronDown, ChevronUp, AlertCircle, Tag } from 'lucide-react';

interface Props {
  problem: Problem;
  assessment: Assessment;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const config: Record<string, { cls: string; icon: string }> = {
    Easy: { cls: 'badge badge-easy', icon: '🟢' },
    Moderate: { cls: 'badge badge-moderate', icon: '🟡' },
    Hard: { cls: 'badge badge-hard', icon: '🔴' },
    Expert: { cls: 'badge badge-expert', icon: '🟣' },
  };
  const c = config[difficulty] || { cls: 'badge', icon: '⚪' };
  return <span className={c.cls}>{c.icon} {difficulty}</span>;
}

export default function ProblemPanel({ problem }: Props) {
  const [showConstraints, setShowConstraints] = useState(true);
  const [showExamples, setShowExamples] = useState(true);

  return (
    <div className="h-full flex flex-col bg-surface-800 overflow-hidden">
      <div className="panel-header flex-shrink-0">
        <BookOpen className="w-4 h-4 text-accent-400" />
        <span className="text-white font-semibold text-sm">Problem Statement</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        <div>
          <div className="flex items-start gap-2 flex-wrap mb-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="badge" style={{ background: 'rgba(56,139,253,0.15)', color: '#58a6ff', border: '1px solid rgba(56,139,253,0.2)' }}>{problem.topic}</span>
            {problem.patterns.slice(0, 1).map((p) => (
              <span key={p} className="badge" style={{ background: 'var(--color-surface-600)', color: 'var(--color-muted)', border: '1px solid var(--color-surface-500)' }}>{p}</span>
            ))}
          </div>
          <h2 className="text-white font-bold text-lg leading-tight">{problem.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted">
            <span>⏱ {problem.timeLimit}s limit</span>
            <span>💾 {problem.memoryLimit}MB memory</span>
          </div>
        </div>

        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{problem.statement}</p>

        <div className="space-y-3">
          <div className="rounded-lg p-3 border border-surface-600" style={{ background: 'rgba(33,38,45,0.5)' }}>
            <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1">Input</p>
            <p className="text-white/85 text-sm">{problem.inputDescription}</p>
          </div>
          <div className="rounded-lg p-3 border border-surface-600" style={{ background: 'rgba(33,38,45,0.5)' }}>
            <p className="text-muted text-xs font-medium uppercase tracking-wide mb-1">Output</p>
            <p className="text-white/85 text-sm">{problem.outputDescription}</p>
          </div>
        </div>

        <div>
          <button onClick={() => setShowConstraints(!showConstraints)} className="flex items-center gap-2 w-full text-left text-sm font-semibold text-white mb-2 hover:text-accent-400 transition-colors">
            <AlertCircle className="w-4 h-4 text-warning-400" />
            Constraints
            {showConstraints ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>
          {showConstraints && (
            <ul className="space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                  <span className="text-warning-400 mt-0.5 flex-shrink-0">•</span>
                  <code className="font-mono text-xs rounded text-warning-300" style={{ background: 'var(--color-surface-700)', padding: '2px 6px' }}>{c}</code>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <button onClick={() => setShowExamples(!showExamples)} className="flex items-center gap-2 w-full text-left text-sm font-semibold text-white mb-3 hover:text-accent-400 transition-colors">
            Examples
            {showExamples ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
          </button>
          {showExamples && (
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="border border-surface-500 rounded-lg overflow-hidden">
                  <div className="px-3 py-1.5 text-xs font-medium text-muted" style={{ background: 'var(--color-surface-700)' }}>Example {i + 1}</div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs text-muted mb-1">Input:</p>
                      <pre className="text-xs font-mono text-accent-300 rounded p-2 overflow-x-auto" style={{ background: 'var(--color-surface-900)' }}>{ex.input}</pre>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1">Output:</p>
                      <pre className="text-xs font-mono text-success-400 rounded p-2 overflow-x-auto" style={{ background: 'var(--color-surface-900)' }}>{ex.output}</pre>
                    </div>
                    {ex.explanation && (
                      <div>
                        <p className="text-xs text-muted mb-1">Explanation:</p>
                        <p className="text-xs text-white/75">{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {problem.tags?.length > 0 && (
          <div>
            <p className="text-muted text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded border" style={{ background: 'var(--color-surface-700)', color: 'var(--color-muted)', borderColor: 'var(--color-surface-500)' }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
