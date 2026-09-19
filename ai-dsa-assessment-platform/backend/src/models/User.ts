import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'student' | 'admin' | 'instructor';
  college?: string;
  batch?: string;
  preferredLanguage: string;
  totalProblems: number;
  solvedProblems: number;
  acceptedProblems: number;
  attemptedProblems: number;
  currentStreak: number;
  totalTime: number; // in seconds
  averageScore: number;
  topicStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
  difficultyStats: Record<string, { attempted: number; solved: number; avgScore: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    college: { type: String, trim: true },
    batch: { type: String, trim: true },
    preferredLanguage: { type: String, default: 'java' },
    totalProblems: { type: Number, default: 0 },
    solvedProblems: { type: Number, default: 0 },
    acceptedProblems: { type: Number, default: 0 },
    attemptedProblems: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    topicStats: { type: Schema.Types.Mixed, default: {} },
    difficultyStats: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
