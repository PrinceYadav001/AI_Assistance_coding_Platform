export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'instructor';
  college?: string;
  batch?: string;
  preferredLanguage: string;
  solvedProblems: number;
  attemptedProblems: number;
  acceptedProblems: number;
  currentStreak: number;
  totalTime: number;
  averageScore: number;
  topicStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
  difficultyStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  category?: string;
}

export interface Hint {
  level: number;
  content: string;
}

export interface Problem {
  _id: string;
  title: string;
  slug: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string[];
  examples: Example[];
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  topic: string;
  secondaryTopics: string[];
  patterns: string[];
  tags: string[];
  companies: string[];
  starterCode: string;
  functionSignature: string;
  timeLimit: number;
  memoryLimit: number;
  visibleTestCases: TestCase[];
  hints?: Hint[];
  isPublished: boolean;
  createdAt: string;
}

export interface TestResult {
  testId: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  executionTime: number;
  memoryUsed: number;
  isHidden: boolean;
}

export interface Assessment {
  _id: string;
  userId: string;
  problemId: Problem | string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: string;
  expiresAt: string;
  submittedAt?: string;
  timeSpent: number;
  code: string;
  language: string;
  approach: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  testResults: TestResult[];
  score: number;
  evaluation: EvaluationResult;
  hintCount: number;
  hintLevel: number;
  aiInteractionCount: number;
  currentStep: string;
  createdAt: string;
}

export interface EvaluationResult {
  correctness: number;
  timeComplexityScore: number;
  spaceComplexityScore: number;
  edgeCasesScore: number;
  codeQualityScore: number;
  reasoningScore: number;
  totalScore: number;
  classification: string;
  strengths: string[];
  weaknesses: string[];
  commonMistakes: string[];
  recommendations: string[];
  nextProblemSuggestion: string;
  aiAnalysis: string;
}

export interface Submission {
  _id: string;
  userId: string;
  problemId: Problem | { title: string; slug: string; difficulty: string; topic: string };
  assessmentId: string;
  code: string;
  language: string;
  status: string;
  testResults: TestResult[];
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  timeComplexity: string;
  spaceComplexity: string;
  score: number;
  evaluation: EvaluationResult;
  submittedAt: string;
  executionTime: number;
  memoryUsed: number;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  type: string;
  message: string;
  level?: number;
  timestamp: string;
}

export interface DashboardStats {
  problemsSolved: number;
  problemsAttempted: number;
  acceptanceRate: number;
  averageScore: number;
  currentStreak: number;
  totalTime: number;
  topicStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
  difficultyStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
}

export interface ExecutionResult {
  status: string;
  stdout?: string;
  stderr?: string;
  compileError?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export type AssessmentStep =
  | 'UNDERSTANDING'
  | 'DATA_STRUCTURE'
  | 'APPROACH'
  | 'CODING'
  | 'TESTING'
  | 'DEBUGGING'
  | 'SUBMITTING'
  | 'COMPLETED';

export type Difficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert';

export const TOPICS = [
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Sorting',
  'Stack',
  'Queue',
  'Linked List',
  'Trees',
  'Binary Search Tree',
  'Graphs',
  'Greedy',
  'Recursion',
  'Backtracking',
  'Dynamic Programming',
  'Intervals',
  'Bit Manipulation',
] as const;

export type Topic = (typeof TOPICS)[number];
