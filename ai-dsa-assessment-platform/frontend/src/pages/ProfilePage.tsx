import { useQuery } from '@tanstack/react-query';
import { Trophy, Flame, Clock, BarChart2, TrendingUp, User, Mail, GraduationCap, Code } from 'lucide-react';
import { dashboardApi } from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../layouts/MainLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  });

  const stats = data?.stats;

  const diffStats = stats?.difficultyStats
    ? Object.entries(stats.difficultyStats).map(([d, s]) => ({
        difficulty: d,
        attempted: (s as { attempted: number }).attempted,
        solved: (s as { solved: number }).solved,
      }))
    : [];

  const topicRadar = stats?.topicStats
    ? Object.entries(stats.topicStats).slice(0, 8).map(([topic, s]) => ({
        topic: topic.slice(0, 12),
        solved: (s as { solved: number }).solved,
      }))
    : [];

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="card p-6 flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</span>
              {user?.college && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{user.college}</span>}
              {user?.batch && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />Batch {user.batch}</span>}
              <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" />{user?.preferredLanguage?.toUpperCase()}</span>
            </div>
          </div>
          <span className="px-3 py-1 text-xs rounded-full bg-accent-600/20 text-accent-400 border border-accent-600/30 font-medium">
            {user?.role}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Trophy className="w-5 h-5" />, label: 'Problems Solved', value: stats?.problemsSolved || 0, color: 'text-warning-400' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Acceptance Rate', value: `${stats?.acceptanceRate || 0}%`, color: 'text-success-400' },
            { icon: <BarChart2 className="w-5 h-5" />, label: 'Average Score', value: `${stats?.averageScore?.toFixed(1) || '0.0'}/10`, color: 'text-accent-400' },
            { icon: <Flame className="w-5 h-5" />, label: 'Current Streak', value: `${stats?.currentStreak || 0} days`, color: 'text-orange-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Difficulty Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diffStats}>
                <XAxis dataKey="difficulty" tick={{ fill: '#7d8590', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7d8590', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', color: '#e6edf3' }} />
                <Bar dataKey="attempted" fill="#388bfd" opacity={0.5} radius={[2, 2, 0, 0]} name="Attempted" />
                <Bar dataKey="solved" fill="#3fb950" radius={[2, 2, 0, 0]} name="Solved" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="text-white font-semibold mb-4">Topic Coverage</h3>
            {topicRadar.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={topicRadar}>
                  <PolarGrid stroke="#21262d" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#7d8590', fontSize: 10 }} />
                  <Radar name="Solved" dataKey="solved" stroke="#388bfd" fill="#388bfd" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted text-sm">
                Solve problems to see topic coverage
              </div>
            )}
          </div>
        </div>

        {/* Total Time */}
        <div className="card p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent-400" />
          <div>
            <p className="text-white font-semibold">Total Practice Time</p>
            <p className="text-muted text-sm">{Math.floor((stats?.totalTime || 0) / 3600)} hours {Math.floor(((stats?.totalTime || 0) % 3600) / 60)} minutes</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
