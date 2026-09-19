import mongoose, { Document, Schema } from 'mongoose';

export type AssessmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface ITestResult {
  testId: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  executionTime?: number;
  memoryUsed?: number;
  isHidden: boolean;
}

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  status: AssessmentStatus;
  startedAt: Date;
  expiresAt: Date;
  submittedAt?: Date;
  timeSpent: number;
  code: string;
  language: string;
  approach: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  testResults: ITestResult[];
  score: number;
  evaluation: Record<string, unknown>;
  hintCount: number;
  hintLevel: number;
  aiInteractionCount: number;
  currentStep: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<ITestResult>({
  testId: String,
  input: String,
  expected: String,
  actual: String,
  status: { type: String, enum: ['PASSED', 'FAILED', 'ERROR', 'TIMEOUT'] },
  executionTime: Number,
  memoryUsed: Number,
  isHidden: { type: Boolean, default: false },
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'EXPIRED'],
      default: 'NOT_STARTED',
    },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    submittedAt: Date,
    timeSpent: { type: Number, default: 0 },
    code: { type: String, default: '' },
    language: { type: String, default: 'java' },
    approach: { type: String, default: '' },
    dataStructure: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    testResults: [TestResultSchema],
    score: { type: Number, default: 0 },
    evaluation: { type: Schema.Types.Mixed, default: {} },
    hintCount: { type: Number, default: 0 },
    hintLevel: { type: Number, default: 0 },
    aiInteractionCount: { type: Number, default: 0 },
    currentStep: { type: String, default: 'UNDERSTANDING' },
  },
  { timestamps: true }
);

AssessmentSchema.index({ userId: 1 });
AssessmentSchema.index({ status: 1 });
AssessmentSchema.index({ userId: 1, status: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
