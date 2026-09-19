import { useQuery } from '@tanstack/react-query';
import { Users, Mail } from 'lucide-react';
import { adminApi } from '../../services/apiClient';
import MainLayout from '../../layouts/MainLayout';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '../../types';

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data.data),
  });

  const users: User[] = data?.users || [];

  return (
    <MainLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
        <div className="card overflow-hidden">
          <div className="card-header">
            <Users className="w-4 h-4 text-accent-400" />
            Users ({users.length})
          </div>
          {isLoading ? (
            <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="divide-y divide-surface-600">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted uppercase bg-surface-900/50">
                <span className="col-span-4">User</span>
                <span className="col-span-2">Role</span>
                <span className="col-span-2">College</span>
                <span className="col-span-1 text-center">Solved</span>
                <span className="col-span-1 text-center">Score</span>
                <span className="col-span-2 text-right">Joined</span>
              </div>
              {users.map((u) => (
                <div key={u._id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-surface-700/30 transition-colors">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-600/20 border border-accent-600/30 flex items-center justify-center text-accent-400 font-bold text-sm flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{u.name}</p>
                      <p className="text-muted text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className={`badge ${u.role === 'admin' ? 'badge-hard' : u.role === 'instructor' ? 'badge-moderate' : 'badge-easy'}`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="col-span-2 text-muted text-sm">{u.college || '—'}</div>
                  <div className="col-span-1 text-center text-white font-medium text-sm">{u.solvedProblems}</div>
                  <div className="col-span-1 text-center text-muted text-sm">{u.averageScore?.toFixed(1) || '0.0'}</div>
                  <div className="col-span-2 text-right text-muted text-xs">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
