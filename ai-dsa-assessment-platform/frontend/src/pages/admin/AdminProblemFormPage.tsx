import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/apiClient';
import MainLayout from '../../layouts/MainLayout';
import toast from 'react-hot-toast';
import { TOPICS } from '../../types';

export default function AdminProblemFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { register, handleSubmit, reset } = useForm();
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [constraints, setConstraints] = useState(['']);
  const [visibleTests, setVisibleTests] = useState([{ input: '', expectedOutput: '', description: '' }]);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin-problem', id],
    queryFn: () => adminApi.getProblem(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (existing) {
      reset(existing);
      if (existing.examples) setExamples(existing.examples);
      if (existing.constraints) setConstraints(existing.constraints);
      if (existing.visibleTestCases) setVisibleTests(existing.visibleTestCases);
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: (data: unknown) => isEdit ? adminApi.updateProblem(id!, data) : adminApi.createProblem(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Problem updated' : 'Problem created');
      qc.invalidateQueries({ queryKey: ['admin-problems'] });
      navigate('/admin/problems');
    },
    onError: () => toast.error('Save failed'),
  });

  const onSubmit = (data: Record<string, unknown>) => {
    saveMutation.mutate({
      ...data,
      examples: examples.filter((e) => e.input || e.output),
      constraints: constraints.filter((c) => c.trim()),
      visibleTestCases: visibleTests.filter((t) => t.input || t.expectedOutput),
      isPublished: true,
    });
  };

  if (isLoading) return <MainLayout><div className="p-6 text-muted">Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/problems')} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Problem' : 'Create Problem'}</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h3 className="text-white font-semibold">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-muted mb-1.5 block">Title *</label>
                <input {...register('title', { required: true })} className="input" placeholder="Problem title" />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-muted mb-1.5 block">Slug *</label>
                <input {...register('slug', { required: true })} className="input" placeholder="problem-slug-kebab-case" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1.5 block">Difficulty *</label>
                <select {...register('difficulty', { required: true })} className="input">
                  {['Easy', 'Moderate', 'Hard', 'Expert'].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-1.5 block">Topic *</label>
                <select {...register('topic', { required: true })} className="input">
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-1.5 block">Time Limit (s)</label>
                <input {...register('timeLimit')} type="number" defaultValue={2} className="input" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1.5 block">Memory Limit (MB)</label>
                <input {...register('memoryLimit')} type="number" defaultValue={256} className="input" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted mb-1.5 block">Problem Statement *</label>
              <textarea {...register('statement', { required: true })} rows={8} className="input resize-none font-mono text-sm" placeholder="Problem description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted mb-1.5 block">Input Description</label>
                <textarea {...register('inputDescription')} rows={2} className="input resize-none text-sm" />
              </div>
              <div>
                <label className="text-sm text-muted mb-1.5 block">Output Description</label>
                <textarea {...register('outputDescription')} rows={2} className="input resize-none text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted mb-1.5 block">Starter Code (Java)</label>
              <textarea {...register('starterCode')} rows={8} className="input resize-none font-mono text-sm" placeholder="// Starter code" />
            </div>
          </div>

          {/* Constraints */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Constraints</h3>
              <button type="button" onClick={() => setConstraints([...constraints, ''])} className="btn-ghost text-xs"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {constraints.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c} onChange={(e) => { const arr = [...constraints]; arr[i] = e.target.value; setConstraints(arr); }} className="input text-sm flex-1" placeholder={`Constraint ${i + 1}`} />
                <button type="button" onClick={() => setConstraints(constraints.filter((_, j) => j !== i))} className="btn-ghost p-2 text-error-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          {/* Examples */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Examples</h3>
              <button type="button" onClick={() => setExamples([...examples, { input: '', output: '', explanation: '' }])} className="btn-ghost text-xs"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {examples.map((ex, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted">Example {i + 1}</span>
                  <button type="button" onClick={() => setExamples(examples.filter((_, j) => j !== i))} className="text-error-400 hover:text-error-300"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Input</label>
                    <textarea value={ex.input} onChange={(e) => { const arr = [...examples]; arr[i].input = e.target.value; setExamples(arr); }} rows={2} className="input text-xs font-mono resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Output</label>
                    <textarea value={ex.output} onChange={(e) => { const arr = [...examples]; arr[i].output = e.target.value; setExamples(arr); }} rows={2} className="input text-xs font-mono resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted mb-1 block">Explanation</label>
                    <input value={ex.explanation} onChange={(e) => { const arr = [...examples]; arr[i].explanation = e.target.value; setExamples(arr); }} className="input text-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visible Test Cases */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Visible Test Cases</h3>
              <button type="button" onClick={() => setVisibleTests([...visibleTests, { input: '', expectedOutput: '', description: '' }])} className="btn-ghost text-xs"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {visibleTests.map((tc, i) => (
              <div key={i} className="card p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted">Test #{i + 1}</span>
                  <button type="button" onClick={() => setVisibleTests(visibleTests.filter((_, j) => j !== i))} className="text-error-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted mb-1 block">Input</label>
                    <textarea value={tc.input} onChange={(e) => { const arr = [...visibleTests]; arr[i].input = e.target.value; setVisibleTests(arr); }} rows={2} className="input text-xs font-mono resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted mb-1 block">Expected Output</label>
                    <textarea value={tc.expectedOutput} onChange={(e) => { const arr = [...visibleTests]; arr[i].expectedOutput = e.target.value; setVisibleTests(arr); }} rows={2} className="input text-xs font-mono resize-none" />
                  </div>
                  <div className="col-span-2">
                    <input value={tc.description} onChange={(e) => { const arr = [...visibleTests]; arr[i].description = e.target.value; setVisibleTests(arr); }} className="input text-xs" placeholder="Test description" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/problems')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
