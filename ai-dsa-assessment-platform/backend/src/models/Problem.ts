import mongoose, { Document, Schema } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  category?: string;
}

export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface IHint {
  level: number;
  content: string;
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string[];
  examples: IExample[];
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  topic: string;
  secondaryTopics: string[];
  patterns: string[];
  tags: string[];
  companies: string[];
  starterCode: string;
  functionSignature: string;
  inputParser: string;
  outputFormatter: string;
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  visibleTestCases: ITestCase[];
  hiddenTestCases: ITestCase[];
  bruteForceApproach: string;
  optimalApproach: string;
  solution: string;
  explanation: string;
  hints: IHint[];
  edgeCases: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  description: String,
  category: String,
});

const ExampleSchema = new Schema<IExample>({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: String,
});

const HintSchema = new Schema<IHint>({
  level: { type: Number, required: true },
  content: { type: String, required: true },
});

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    statement: { type: String, required: true },
    inputDescription: { type: String, required: true },
    outputDescription: { type: String, required: true },
    constraints: [{ type: String }],
    examples: [ExampleSchema],
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard', 'Expert'], required: true },
    topic: { type: String, required: true },
    secondaryTopics: [{ type: String }],
    patterns: [{ type: String }],
    tags: [{ type: String }],
    companies: [{ type: String }],
    starterCode: { type: String, required: true },
    functionSignature: { type: String, required: true },
    inputParser: { type: String, default: 'default' },
    outputFormatter: { type: String, default: 'default' },
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    visibleTestCases: [TestCaseSchema],
    hiddenTestCases: [TestCaseSchema],
    bruteForceApproach: { type: String, default: '' },
    optimalApproach: { type: String, default: '' },
    solution: { type: String, default: '' },
    explanation: { type: String, default: '' },
    hints: [HintSchema],
    edgeCases: [{ type: String }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProblemSchema.index({ topic: 1 });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ isPublished: 1 });
ProblemSchema.index({ title: 'text', tags: 'text', topic: 'text' });

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
