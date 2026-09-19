import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Code2, FileText, BarChart2, TrendingUp, Shield, Plus, ChevronRight } from 'lucide-react';
import { adminApi } from '../../services/apiClient';
import MainLayout from '../../layouts/MainLayout';

export default function AdminPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

  const stats = [
    { label: 'Total Users', value: data?.totalUsers || 0, icon: <Users className="w-5 h-5" />, path: '/admin/users', color: 'text-accent-400' },
    { label: 'Total Problems', value: data?.totalProblems || 0, icon: <Code2 className="w-5 h-5" />, path: '/admin/problems', color: 'text-success-400' },
    { label: 'Total Submissions', value: data?.totalSubmissions || 0, icon: <FileText className="w-5 h-5" />, path: '/admin/submissions', color: 'text-warning-400' },
    { label: 'Active Assessments', value: data?.activeAssessments || 0, icon: <BarChart2 className="w-5 h-5" />, path: '/admin/submissions', color: 'text-error-400' },
    { label: 'Acceptance Rate', value: `${data?.acceptanceRate || 0}%`, icon: <TrendingUp className="w-5 h-5" />, path: '/admin/submissions', color: 'text-purple-400' },
    { label: 'Avg Score', value: `${data?.averageScore || '0.0'}/10`, icon: <Shield className="w-5 h-5" />, path: '/admin', color: 'text-orange-400' },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-muted text-sm mt-1">Platform overview and management</p>
          </div>
          <button onClick={() => navigate('/admin/problems/create')} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              onClick={() => navigate(s.path)}
              className="card p-5 cursor-pointer hover:border-surface-500 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${s.color}`}>{s.icon}</div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
              </div>
              <div className="text-2xl font-bold text-white">{isLoading ? '...' : s.value}</div>
              <div className="text-muted text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Manage Problems', path: '/admin/problems', icon: <Code2 className="w-4 h-4" /> },
              { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
              { label: 'View Submissions', path: '/admin/submissions', icon: <FileText className="w-4 h-4" /> },
              { label: 'Create Problem', path: '/admin/problems/create', icon: <Plus className="w-4 h-4" /> },
            ].map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="btn-secondary text-xs justify-center py-3 flex-col gap-2 h-auto"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
