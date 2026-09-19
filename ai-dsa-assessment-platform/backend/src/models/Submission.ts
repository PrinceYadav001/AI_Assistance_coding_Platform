import mongoose, { Document, Schema } from 'mongoose';

export type SubmissionStatus =
  | 'COMPILED'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'WRONG_ANSWER'
  | 'ACCEPTED'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'PARTIALLY_CORRECT';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  code: string;
  language: string;
  status: SubmissionStatus;
  testResults: Array<{
    testId: string;
    status: string;
    input: string;
    expected: string;
    actual: string;
    executionTime: number;
    memoryUsed: number;
    isHidden: boolean;
  }>;
  visiblePassed: number;
  visibleTotal: number;
  hiddenPassed: number;
  hiddenTotal: number;
  timeComplexity: string;
  spaceComplexity: string;
  score: number;
  evaluation: {
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
  };
  submittedAt: Date;
  executionTime: number;
  memoryUsed: number;
  compilerOutput: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    code: { type: String, required: true },
    language: { type: String, default: 'java' },
    status: {
      type: String,
      enum: [
        'COMPILED',
        'COMPILE_ERROR',
        'RUNTIME_ERROR',
        'WRONG_ANSWER',
        'ACCEPTED',
        'TIME_LIMIT_EXCEEDED',
        'MEMORY_LIMIT_EXCEEDED',
        'PARTIALLY_CORRECT',
      ],
      required: true,
    },
    testResults: [Schema.Types.Mixed],
    visiblePassed: { type: Number, default: 0 },
    visibleTotal: { type: Number, default: 0 },
    hiddenPassed: { type: Number, default: 0 },
    hiddenTotal: { type: Number, default: 0 },
    timeComplexity: String,
    spaceComplexity: String,
    score: { type: Number, default: 0 },
    evaluation: { type: Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: Date.now },
    executionTime: { type: Number, default: 0 },
    memoryUsed: { type: Number, default: 0 },
    compilerOutput: { type: String, default: '' },
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1 });
SubmissionSchema.index({ problemId: 1 });
SubmissionSchema.index({ userId: 1, problemId: 1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
