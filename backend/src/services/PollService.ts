import Poll, { IPoll, Vote } from '../models/Poll';
import ChatMessage from '../models/Chat';

// Interface for vote percentages
interface VotePercentage {
  option: string;
  votes: number;
  percentage: number;
}

// Interface for poll results
interface PollResults {
  pollId: string;
  question: string;
  options: VotePercentage[];
  totalVotes: number;
  correctAnswers: string[];
}

// Service for managing polls with race condition prevention
class PollService {
  // Create a new poll - ensures no active poll exists in session
  static async createPoll(
    question: string,
    options: string[],
    duration: number,
    createdBy: string,
    sessionId: string
  ): Promise<IPoll> {
    // Check if active poll already exists in this session
    const activePolls = await Poll.find({ sessionId, active: true });

    if (activePolls.length > 0) {
      throw new Error('An active poll already exists in this session');
    }

    const poll = new Poll({
      question,
      options,
      duration,
      createdBy,
      sessionId,
      startTime: new Date(),
    });

    await poll.save();
    return poll;
  }

  // Submit a vote with duplicate prevention
  static async submitVote(
    pollId: string,
    studentName: string,
    option: string
  ): Promise<{ poll: IPoll; results: VotePercentage[] }> {
    const normalizedName = studentName.toLowerCase().trim();

    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (!poll.active) {
      throw new Error('Poll is no longer active');
    }

    // Check if student already voted (race condition prevention)
    const studentVoted = poll.votes.some(
      (v: Vote) => v.studentName === normalizedName
    );

    if (studentVoted) {
      throw new Error(`Student ${studentName} has already voted`);
    }

    // Validate option exists
    if (!poll.options.includes(option)) {
      throw new Error(`Invalid option: ${option}`);
    }

    // Add vote atomically using MongoDB $push operator
    const updated = await Poll.findByIdAndUpdate(
      pollId,
      {
        $push: {
          votes: {
            studentName: normalizedName,
            option,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error('Failed to add vote');
    }

    // Calculate and return live percentages
    const results = this.calculatePercentages(updated);

    return { poll: updated, results };
  }

  // Get current active poll with remaining time
  static async getCurrentPoll(sessionId: string): Promise<{
    poll: IPoll;
    remainingTime: number;
  } | null> {
    const activePolls = await Poll.find({ sessionId, active: true });

    if (activePolls.length === 0) {
      return null;
    }

    const poll = activePolls[0];
    const remainingTime = this.getRemainingTime(poll);

    return { poll, remainingTime };
  }

  // Get poll results with percentages
  static async getResults(pollId: string): Promise<PollResults> {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    const percentages = this.calculatePercentages(poll);

    return {
      pollId: poll._id.toString(),
      question: poll.question,
      options: percentages,
      totalVotes: poll.votes.length,
      correctAnswers: poll.correctAnswers,
    };
  }

  // Get all past inactive polls (history)
  static async getHistory(sessionId: string): Promise<IPoll[]> {
    return Poll.find({ sessionId, active: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  // End a poll (set active to false)
  static async endPoll(pollId: string): Promise<IPoll | null> {
    return Poll.findByIdAndUpdate(
      pollId,
      { active: false },
      { new: true }
    );
  }

  // Calculate remaining time in seconds
  static getRemainingTime(poll: IPoll): number {
    const now = new Date().getTime();
    const startTime = new Date(poll.startTime).getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const remainingSeconds = Math.max(0, poll.duration - elapsedSeconds);

    return remainingSeconds;
  }

  // Helper: Calculate vote percentages
  private static calculatePercentages(poll: IPoll): VotePercentage[] {
    const totalVotes = poll.votes.length;

    return poll.options.map((option: string) => {
      const votes = poll.votes.filter((v: Vote) => v.option === option).length;
      const percentage = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;

      return {
        option,
        votes,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
      };
    });
  }

  // Mark correct answers for poll
  static async markCorrectAnswers(
    pollId: string,
    correctAnswers: string[]
  ): Promise<IPoll | null> {
    return Poll.findByIdAndUpdate(
      pollId,
      { correctAnswers },
      { new: true }
    );
  }

  // Get poll by ID
  static async getPoll(pollId: string): Promise<IPoll | null> {
    return Poll.findById(pollId);
  }

  // Get all polls in session
  static async getPollsBySession(sessionId: string): Promise<IPoll[]> {
    return Poll.find({ sessionId }).sort({ createdAt: -1 });
  }
}

// Service for managing chat messages
class ChatService {
  // Save a chat message
  static async saveMessage(
    pollId: string,
    from: string,
    text: string,
    sessionId: string
  ) {
    const message = new ChatMessage({
      pollId,
      from: from.toLowerCase().trim(),
      text,
      sessionId,
      timestamp: new Date(),
    });

    await message.save();
    return message;
  }

  // Get messages for a poll
  static async getMessagesByPoll(pollId: string) {
    return ChatMessage.find({ pollId }).sort({ timestamp: 1 });
  }

  // Get recent messages for a session
  static async getMessagesBySession(sessionId: string) {
    return ChatMessage.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
  }

  // Delete old messages (cleanup)
  static async deleteOldMessages(sessionId: string, daysOld: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return ChatMessage.deleteMany({
      sessionId,
      timestamp: { $lt: cutoffDate },
    });
  }
}

export { PollService, ChatService, VotePercentage, PollResults };

