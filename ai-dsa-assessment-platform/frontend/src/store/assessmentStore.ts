import { create } from 'zustand';
import type { Assessment, AIMessage, TestResult, AssessmentStep } from '../types';

interface AssessmentStore {
  assessment: Assessment | null;
  code: string;
  approach: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  currentStep: AssessmentStep;
  isRunning: boolean;
  isSubmitting: boolean;
  lastRunResults: TestResult[] | null;
  activeTab: 'sample' | 'custom' | 'result';
  customInput: string;
  aiMessages: AIMessage[];
  isAILoading: boolean;
  rightPanelTab: 'ai' | 'hints' | 'review' | 'progress';

  setAssessment: (assessment: Assessment) => void;
  setCode: (code: string) => void;
  setApproach: (approach: string) => void;
  setDataStructure: (ds: string) => void;
  setTimeComplexity: (tc: string) => void;
  setSpaceComplexity: (sc: string) => void;
  setCurrentStep: (step: AssessmentStep) => void;
  setRunning: (running: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setLastRunResults: (results: TestResult[]) => void;
  setActiveTab: (tab: 'sample' | 'custom' | 'result') => void;
  setCustomInput: (input: string) => void;
  addAIMessage: (msg: AIMessage) => void;
  setAILoading: (loading: boolean) => void;
  setRightPanelTab: (tab: 'ai' | 'hints' | 'review' | 'progress') => void;
  resetAssessment: () => void;
  clearAIMessages: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  assessment: null,
  code: '',
  approach: '',
  dataStructure: '',
  timeComplexity: '',
  spaceComplexity: '',
  currentStep: 'UNDERSTANDING',
  isRunning: false,
  isSubmitting: false,
  lastRunResults: null,
  activeTab: 'sample',
  customInput: '',
  aiMessages: [],
  isAILoading: false,
  rightPanelTab: 'ai',

  setAssessment: (assessment) => set({ assessment }),
  setCode: (code) => set({ code }),
  setApproach: (approach) => set({ approach }),
  setDataStructure: (dataStructure) => set({ dataStructure }),
  setTimeComplexity: (timeComplexity) => set({ timeComplexity }),
  setSpaceComplexity: (spaceComplexity) => set({ spaceComplexity }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setRunning: (isRunning) => set({ isRunning }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setLastRunResults: (lastRunResults) => set({ lastRunResults }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setCustomInput: (customInput) => set({ customInput }),
  addAIMessage: (msg) => set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
  setAILoading: (isAILoading) => set({ isAILoading }),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  resetAssessment: () =>
    set({
      assessment: null,
      code: '',
      approach: '',
      dataStructure: '',
      timeComplexity: '',
      spaceComplexity: '',
      currentStep: 'UNDERSTANDING',
      isRunning: false,
      isSubmitting: false,
      lastRunResults: null,
      activeTab: 'sample',
      customInput: '',
      aiMessages: [],
    }),
  clearAIMessages: () => set({ aiMessages: [] }),
}));
