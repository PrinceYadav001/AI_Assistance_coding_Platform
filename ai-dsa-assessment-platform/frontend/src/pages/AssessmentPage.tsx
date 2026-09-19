import { useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '../services/apiClient';
import { useAssessmentStore } from '../store/assessmentStore';
import type { Assessment, Problem } from '../types';
import AssessmentHeader from '../components/assessment/AssessmentHeader';
import ProblemPanel from '../components/assessment/ProblemPanel';
import CodeEditorPanel from '../components/assessment/CodeEditorPanel';
import InstructorHubPanel from '../components/assessment/InstructorHubPanel';
import TestPanel from '../components/assessment/TestPanel';

const AUTOSAVE_DEBOUNCE = 3000;

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const {
    setAssessment, setCode, code, approach, dataStructure, timeComplexity, spaceComplexity,
    resetAssessment, currentStep,
  } = useAssessmentStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentApi.getById(id!).then((r) => r.data.data as Assessment),
    enabled: !!id,
    refetchInterval: false,
  });

  useEffect(() => {
    if (data) {
      setAssessment(data);
      if (data.code) setCode(data.code);
    }
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      assessmentApi.update(id!, updates).then((r) => r.data.data),
    onSuccess: (updated) => {
      setAssessment(updated as Assessment);
      qc.setQueryData(['assessment', id], updated);
    },
  });

  const triggerAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (id && data?.status === 'IN_PROGRESS') {
        saveMutation.mutate({ code, approach, dataStructure, timeComplexity, spaceComplexity, currentStep });
      }
    }, AUTOSAVE_DEBOUNCE);
  }, [id, code, approach, dataStructure, timeComplexity, spaceComplexity, currentStep, data?.status]);

  useEffect(() => {
    triggerAutosave();
  }, [code, approach, dataStructure, timeComplexity, spaceComplexity]);

  useEffect(() => {
    return () => { resetAssessment(); };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted text-sm">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-400 mb-4">Failed to load assessment</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (data.status === 'SUBMITTED') {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">Assessment Submitted!</h2>
          <p className="text-muted text-sm mb-6">Your assessment has been evaluated.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/review/${data._id}`)} className="btn btn-primary">View Results</button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (data.status === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-white mb-2">Time&apos;s Up!</h2>
          <p className="text-muted text-sm mb-6">Your assessment time has expired.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const problem = data.problemId as Problem;

  return (
    <div className="h-screen flex flex-col bg-surface-950 overflow-hidden">
      <AssessmentHeader assessment={data} problem={problem} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[340px] flex-shrink-0 overflow-hidden border-r border-surface-600">
          <ProblemPanel problem={problem} assessment={data} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditorPanel assessment={data} problem={problem} />
          </div>
          <div className="h-[260px] border-t border-surface-600 flex-shrink-0">
            <TestPanel assessment={data} problem={problem} />
          </div>
        </div>
        <div className="w-[340px] flex-shrink-0 overflow-hidden border-l border-surface-600">
          <InstructorHubPanel assessment={data} problem={problem} />
        </div>
      </div>
    </div>
  );
}
