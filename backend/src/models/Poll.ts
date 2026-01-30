import mongoose, { Document, Schema } from 'mongoose';

// Interface for Vote to maintain type safety
interface Vote {
  studentName: string;
  option: string;
}

// Interface for Poll document
interface IPoll extends Document {
  question: string;
  options: string[];
  duration: number;
  startTime: Date;
  votes: Vote[];
  active: boolean;
  correctAnswers: string[];
  createdBy: string;
  sessionId: string;
}

// Define the Poll schema
const pollSchema = new Schema<IPoll>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2,
        message: 'Poll must have at least 2 options',
      },
    },
    duration: {
      type: Number,
      required: true,
      min: 10,
      max: 3600, // max 1 hour
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    votes: [
      {
        studentName: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        option: {
          type: String,
          required: true,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    correctAnswers: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one vote per student per poll
pollSchema.index({ _id: 1, 'votes.studentName': 1 }, { unique: false });

// Create a unique constraint handler at application level
pollSchema.methods.addVote = function (studentName: string, option: string) {
  const lowerName = studentName.toLowerCase().trim();

  // Check if student already voted
  const existingVote = this.votes.find(
    (v: Vote) => v.studentName === lowerName
  );

  if (existingVote) {
    throw new Error(`Student ${studentName} has already voted`);
  }

  // Validate option exists
  if (!this.options.includes(option)) {
    throw new Error(`Invalid option: ${option}`);
  }

  this.votes.push({ studentName: lowerName, option });
  return this;
};

// Get vote statistics
pollSchema.methods.getStats = function () {
  const stats: { [key: string]: number } = {};

  this.options.forEach((option: string) => {
    stats[option] = this.votes.filter((v: Vote) => v.option === option).length;
  });

  return {
    totalVotes: this.votes.length,
    stats,
  };
};

// Create and export the model
const Poll = mongoose.model<IPoll>('Poll', pollSchema);

export default Poll;
export type { IPoll, Vote };
