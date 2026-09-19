import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { adminApi } from '../../services/apiClient';
import MainLayout from '../../layouts/MainLayout';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: () => adminApi.getSubmissions().then((r) => r.data.data),
  });

  const submissions = data?.submissions || [];

  const statusColor: Record<string, string> = {
    ACCEPTED: 'text-success-400', PARTIALLY_CORRECT: 'text-warning-400',
    WRONG_ANSWER: 'text-error-400', COMPILE_ERROR: 'text-error-400', TIMEOUT: 'text-orange-400',
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">All Submissions</h1>
        <div className="card overflow-hidden">
          <div className="card-header"><FileText className="w-4 h-4 text-accent-400" /> Submissions ({submissions.length})</div>
          {isLoading ? (
            <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="divide-y divide-surface-600">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted uppercase bg-surface-900/50">
                <span className="col-span-3">Student</span>
                <span className="col-span-3">Problem</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-1 text-center">Score</span>
                <span className="col-span-1 text-center">Tests</span>
                <span className="col-span-2 text-right">When</span>
              </div>
              {submissions.map((sub: { _id: string; userId: { name: string; email: string }; problemId: { title: string; difficulty: string }; status: string; score: number; visiblePassed?: number; visibleTotal?: number; createdAt: string }) => (
                <div key={sub._id}
                  className="grid grid-cols-12 items-center px-4 py-3 hover:bg-surface-700/30 cursor-pointer"
                  onClick={() => navigate(`/submissions/${sub._id}`)}>
                  <div className="col-span-3">
                    <p className="text-white text-sm font-medium">{sub.userId?.name}</p>
                    <p className="text-muted text-xs">{sub.userId?.email}</p>
                  </div>
                  <div className="col-span-3 text-white text-sm truncate">{sub.problemId?.title}</div>
                  <div className={clsx('col-span-2 text-xs font-medium', statusColor[sub.status] || 'text-muted')}>{sub.status.replace(/_/g, ' ')}</div>
                  <div className="col-span-1 text-center text-white font-bold text-sm">{sub.score}/10</div>
                  <div className="col-span-1 text-center text-muted text-xs">{sub.visiblePassed}/{sub.visibleTotal}</div>
                  <div className="col-span-2 text-right text-muted text-xs">{formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}</div>
                </div>
              ))}
              {submissions.length === 0 && <div className="py-12 text-center text-muted">No submissions yet</div>}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
