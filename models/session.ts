import mongoose, { Schema } from 'mongoose';

const SesionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
  },
  { timestamps: true }
);

export const Session =
  mongoose.models.Session || mongoose.model('Session', SesionSchema);
