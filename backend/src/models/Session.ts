import mongoose, { Document, Schema } from 'mongoose';

// Interface for Session (manages students connected via socket)
interface ISession extends Document {
  sessionId: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  active: boolean;
  students: string[];
}

// Define the Session schema
const sessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    students: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
export type { ISession };
