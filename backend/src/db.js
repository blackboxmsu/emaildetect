import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded regardless of execution directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let isMongoConnected = false;
const inMemoryStore = new Map();

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/email_threat_forensics';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`✔ MongoDB connected successfully`);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.log(`✖ MongoDB connection failed (${err.message.split(',')[0]})`);
    return false;
  }
}

export function isConnected() {
  return isMongoConnected;
}

export const fallbackStorage = {
  saveCase: (c) => {
    inMemoryStore.set(c.caseId, c);
    return c;
  },
  getCase: (id) => inMemoryStore.get(id),
  getAllCases: () => Array.from(inMemoryStore.values()),
  count: () => inMemoryStore.size
};
