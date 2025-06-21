import mongoose from 'mongoose';

const db = process.env.MONGODB_URI!;

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(db);
}
