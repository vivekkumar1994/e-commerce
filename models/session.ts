import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true }, // Renamed from 'id' to 'sessionId' to avoid confusion with MongoDB's internal _id
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Create model only once (to avoid OverwriteModelError in Next.js hot reload)
export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
