import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the formData subfield type
interface IFormData {
  marker: string;
  value: string;
}

// Define the full user type
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  identifier: string;
  avatar:string;
  formData: IFormData[];
  role: 'user' | 'admin';
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

// Mongoose schema
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    identifier: { type: String },
    formData: [
      {
        marker: { type: String,  },
        value: { type: String, },
      },
    ],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: { type: String, default: '' }, 
  },
  { timestamps: true }
);

// 🔐 Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// 🔍 Add method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ⬇ Export the model
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
