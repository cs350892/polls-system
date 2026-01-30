import mongoose, { Document, Schema } from 'mongoose';

// Interface for ChatMessage document
interface IChatMessage extends Document {
  pollId: string;
  from: string;
  text: string;
  timestamp: Date;
  sessionId: string;
}

// Define the ChatMessage schema
const chatMessageSchema = new Schema<IChatMessage>(
  {
    pollId: {
      type: String,
      required: true,
      index: true, // Index for faster queries by pollId
    },
    from: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by time
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
chatMessageSchema.index({ pollId: 1, timestamp: 1 });
chatMessageSchema.index({ sessionId: 1, timestamp: -1 });

// Create and export the model
const ChatMessage = mongoose.model<IChatMessage>(
  'ChatMessage',
  chatMessageSchema
);

export default ChatMessage;
export type { IChatMessage };
