import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Flame, Clock, Target, TrendingUp, BookOpen,
  Play, BarChart2, CheckCircle2, XCircle, ChevronRight, Zap, FileText, Code2
} from 'lucide-react';
import { dashboardApi, assessmentApi } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import clsx from 'clsx';

interface DifficultyBadgeProps { difficulty: string }
function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const classes: Record<string, string> = {
    Easy: 'badge badge-easy', Moderate: 'badge badge-moderate', Hard: 'badge badge-hard', Expert: 'badge badge-expert'
  };
  return <span className={classes[difficulty] || 'badge'}>{difficulty}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { cls: string; icon: React.ReactNode }> = {
    ACCEPTED: { cls: 'text-success-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    PARTIALLY_CORRECT: { cls: 'text-warning-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    WRONG_ANSWER: { cls: 'text-error-400', icon: <XCircle className="w-3.5 h-3.5" /> },
    COMPILE_ERROR: { cls: 'text-error-400', icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const c = config[status] || { cls: 'text-muted', icon: <></> };
  return <span className={clsx('flex items-center gap-1 text-xs font-medium', c.cls)}>{c.icon}{status.replace(/_/g, ' ')}</span>;
}

function StatCard({ icon, label, value, sub, color = 'accent' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    accent: 'bg-accent-600/15 border-accent-600/20 text-accent-400',
    success: 'bg-success-600/15 border-success-600/20 text-success-400',
    warning: 'bg-warning-500/15 border-warning-500/20 text-warning-400',
    error: 'bg-error-500/15 border-error-500/20 text-error-400'
  };
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={clsx('p-2.5 rounded-lg border', colorMap[color])}>{icon}</div>
      <div>
        <p className="text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type TopicStat = { attempted: number; solved: number };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  });

  const startMutation = useMutation({
    mutationFn: () => assessmentApi.start(),
    onSuccess: (res) => navigate(`/assessment/${res.data.data._id}`),
    onError: () => toast.error('Failed to start assessment. Please try again.'),
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 animate-pulse space-y-4">
          <div className="h-8 w-64 skeleton rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-lg" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  const stats = data?.stats;
  const recentSubmissions = data?.recentSubmissions || [];
  const scoreHistory = data?.scoreHistory || [];
  const activeAssessment = data?.activeAssessment;

  const topicData = stats?.topicStats
    ? Object.entries(stats.topicStats as Record<string, TopicStat>).slice(0, 8).map(([topic, s]) => ({
        topic: topic.slice(0, 12),
        attempted: s.attempted,
        solved: s.solved,
      }))
    : [];

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-muted text-sm mt-1">
              {user?.college && `${user.college} • `}
              {user?.batch && `Batch ${user.batch}`}
            </p>
          </div>
          <div className="flex gap-3">
            {activeAssessment && (
              <button onClick={() => navigate(`/assessment/${(activeAssessment as { _id: string })._id}`)} className="btn btn-warning">
                <Play className="w-4 h-4" /> Resume Assessment
              </button>
            )}
            <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="btn btn-primary">
              {startMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
              Start Assessment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<Trophy className="w-5 h-5" />} label="Solved" value={stats?.problemsSolved || 0} />
          <StatCard icon={<Target className="w-5 h-5" />} label="Attempted" value={stats?.problemsAttempted || 0} color="warning" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Acceptance" value={`${stats?.acceptanceRate || 0}%`} color="success" />
          <StatCard icon={<BarChart2 className="w-5 h-5" />} label="Avg Score" value={`${(stats?.averageScore ?? 0).toFixed(1)}/10`} />
          <StatCard icon={<Flame className="w-5 h-5" />} label="Streak" value={`${stats?.currentStreak || 0} days`} color="warning" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Practice Time" value={`${Math.round((stats?.totalTime || 0) / 3600)}h`} color="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent-400" /> Score History
            </h3>
            {scoreHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={(scoreHistory as { score: number; createdAt: string }[]).slice(0, 15).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="createdAt" hide />
                  <YAxis domain={[0, 10]} tick={{ fill: '#7d8590', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }}
                    formatter={(value) => [String(value) + '/10', 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#388bfd" strokeWidth={2} dot={{ fill: '#388bfd', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted text-sm">
                No submissions yet. Start an assessment!
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-success-400" /> Topic Performance
            </h3>
            {topicData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="topic" tick={{ fill: '#7d8590', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#7d8590', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }} />
                  <Bar dataKey="attempted" fill="#388bfd" opacity={0.5} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="solved" fill="#3fb950" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted text-sm">
                Solve some problems to see topic stats
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <FileText className="w-4 h-4 text-accent-400" />
            Recent Submissions
            <button onClick={() => navigate('/submissions')} className="ml-auto text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {recentSubmissions.length > 0 ? (
            <div className="divide-y divide-surface-600">
              {(recentSubmissions as { _id: string; problemId: { title: string; difficulty: string }; status: string; score: number; createdAt: string }[]).map((sub) => (
                <div key={sub._id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-700/50 cursor-pointer transition-colors" onClick={() => navigate(`/submissions/${sub._id}`)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{sub.problemId?.title || 'Unknown Problem'}</p>
                    <p className="text-muted text-xs">{formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</p>
                  </div>
                  <DifficultyBadge difficulty={sub.problemId?.difficulty} />
                  <StatusBadge status={sub.status} />
                  <span className="text-white text-sm font-bold w-12 text-right">{sub.score}/10</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted">
              <Code2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No submissions yet</p>
              <button onClick={() => startMutation.mutate()} className="btn btn-primary mt-4 text-sm">
                Start Your First Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
