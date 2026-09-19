import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  difficulty: string;
  attempted: number;
  solved: number;
  accuracy: number;
  averageScore: number;
  averageTime: number;
  hintsUsed: number;
  commonMistakes: string[];
  lastAttemptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    attempted: { type: Number, default: 0 },
    solved: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    commonMistakes: [{ type: String }],
    lastAttemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, topic: 1 });
ProgressSchema.index({ userId: 1 });

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
