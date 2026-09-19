import { useEffect, useState } from 'react';
import { Brain, Timer, ChevronLeft, Settings } from 'lucide-react';
import type { Assessment, Problem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

interface Props {
  assessment: Assessment;
  problem: Problem;
}

export default function AssessmentHeader({ assessment }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calcTime = () => {
      const now = new Date().getTime();
      const expires = new Date(assessment.expiresAt).getTime();
      return Math.max(0, Math.floor((expires - now) / 1000));
    };
    setTimeLeft(calcTime());
    const interval = setInterval(() => {
      const remaining = calcTime();
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [assessment.expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 600 && timeLeft > 0;
  const isDanger = timeLeft < 300 && timeLeft > 0;

  const timerClass = isDanger
    ? 'timer-danger font-mono text-2xl font-bold'
    : isWarning
    ? 'timer-warning font-mono text-2xl font-bold'
    : 'text-white font-mono text-2xl font-bold';

  return (
    <header className="bg-surface-900 border-b border-surface-600 flex items-center px-4 py-2.5 gap-4 flex-shrink-0 z-20">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={() => navigate('/dashboard')} className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-surface-700 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="p-1.5 bg-accent-600/20 rounded-lg border border-accent-600/30">
          <Brain className="w-4 h-4 text-accent-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">AI Assisted Coding Assessment</p>
          <p className="text-muted text-xs">Practice Lab{user?.batch && ` • Batch ${user.batch}`}</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {['Briefing', 'Assessment', 'Debrief', 'Instructor Hub'].map((tab) => (
          <button key={tab} className={clsx('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', tab === 'Assessment' ? 'bg-accent-600/20 text-accent-400 border border-accent-600/30' : 'text-muted hover:text-white')}>
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center">
        <div className={timerClass}>
          {String(minutes).padStart(2, '0')} : {String(seconds).padStart(2, '0')}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Timer className="w-3 h-3 text-muted" />
          <span className="text-muted text-xs">{isDanger ? '⚠️ Time running out!' : isWarning ? 'Hurry up!' : 'Time remaining'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-white text-sm font-medium">{user?.name}</p>
          <p className="text-muted text-xs">Interactive Assessment</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-accent-600/30 border border-accent-600/50 flex items-center justify-center text-accent-400 font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-surface-700 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
