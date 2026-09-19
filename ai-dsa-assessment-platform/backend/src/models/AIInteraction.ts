import mongoose, { Document, Schema } from 'mongoose';

export type AIInteractionType =
  | 'CLARIFICATION'
  | 'PLAN'
  | 'HINT'
  | 'DEBUG'
  | 'DRY_RUN'
  | 'OPTIMIZE'
  | 'SOLUTION'
  | 'REVIEW'
  | 'CHAT';

export interface IAIInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  message: string;
  response: string;
  type: AIInteractionType;
  hintLevel: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const AIInteractionSchema = new Schema<IAIInteraction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
    type: {
      type: String,
      enum: ['CLARIFICATION', 'PLAN', 'HINT', 'DEBUG', 'DRY_RUN', 'OPTIMIZE', 'SOLUTION', 'REVIEW', 'CHAT'],
      required: true,
    },
    hintLevel: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AIInteractionSchema.index({ assessmentId: 1 });
AIInteractionSchema.index({ userId: 1 });

export const AIInteraction = mongoose.model<IAIInteraction>('AIInteraction', AIInteractionSchema);
