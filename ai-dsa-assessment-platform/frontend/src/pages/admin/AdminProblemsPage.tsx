import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Code2 } from 'lucide-react';
import { adminApi } from '../../services/apiClient';
import MainLayout from '../../layouts/MainLayout';
import type { Problem } from '../../types';
import toast from 'react-hot-toast';

function DifficultyBadge({ d }: { d: string }) {
  const cls = { Easy: 'badge-easy', Moderate: 'badge-moderate', Hard: 'badge-hard', Expert: 'badge bg-purple-500/20 text-purple-400 border border-purple-500/30' };
  return <span className={cls[d as keyof typeof cls] || 'badge'}>{d}</span>;
}

export default function AdminProblemsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-problems'],
    queryFn: () => adminApi.getProblems().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProblem(id),
    onSuccess: () => {
      toast.success('Problem deleted');
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const problems: Problem[] = (data?.problems || []).filter((p: Problem) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Problem Management</h1>
          <button onClick={() => navigate('/admin/problems/create')} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Problem
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-600 bg-surface-900 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problems..." className="input pl-9 text-sm" />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="divide-y divide-surface-600">
              <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-muted uppercase bg-surface-900/50">
                <span className="col-span-5">Title</span>
                <span className="col-span-2">Difficulty</span>
                <span className="col-span-2">Topic</span>
                <span className="col-span-1 text-center">Tests</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>
              {problems.map((p) => (
                <div key={p._id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-surface-700/30">
                  <div className="col-span-5">
                    <p className="text-white text-sm font-medium">{p.title}</p>
                    <p className="text-muted text-xs">{p.isPublished ? '✅ Published' : '⬜ Draft'}</p>
                  </div>
                  <div className="col-span-2"><DifficultyBadge d={p.difficulty} /></div>
                  <div className="col-span-2 text-muted text-sm">{p.topic}</div>
                  <div className="col-span-1 text-center text-muted text-sm">
                    {p.visibleTestCases?.length || 0}
                  </div>
                  <div className="col-span-2 flex items-center gap-2 justify-end">
                    <button onClick={() => navigate(`/admin/problems/${p._id}/edit`)} className="btn-ghost p-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p._id); }}
                      className="btn-ghost p-1.5 text-error-400 hover:bg-error-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {problems.length === 0 && (
                <div className="py-12 text-center text-muted">
                  <Code2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>No problems found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
