import Poll, { IPoll, Vote } from '../models/Poll';
import ChatMessage from '../models/Chat';

// Service for managing polls with race condition prevention
class PollService {
  // Create a new poll
  static async createPoll(
    question: string,
    options: string[],
    duration: number,
    createdBy: string,
    sessionId: string
  ): Promise<IPoll> {
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

  // Add vote with race condition prevention
  static async addVote(
    pollId: string,
    studentName: string,
    option: string
  ): Promise<IPoll> {
    // Use findByIdAndUpdate with atomic operation to prevent race conditions
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (!poll.active) {
      throw new Error('Poll is no longer active');
    }

    // Check if student already voted
    const studentVoted = poll.votes.some(
      (v: Vote) => v.studentName === studentName.toLowerCase().trim()
    );

    if (studentVoted) {
      throw new Error(`Student ${studentName} has already voted`);
    }

    // Validate option
    if (!poll.options.includes(option)) {
      throw new Error(`Invalid option: ${option}`);
    }

    // Add vote atomically
    const updated = await Poll.findByIdAndUpdate(
      pollId,
      {
        $push: {
          votes: {
            studentName: studentName.toLowerCase().trim(),
            option,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error('Failed to add vote');
    }

    return updated;
  }

  // Get poll by ID
  static async getPoll(pollId: string): Promise<IPoll | null> {
    return Poll.findById(pollId);
  }

  // Get all polls in a session
  static async getPollsBySession(sessionId: string): Promise<IPoll[]> {
    return Poll.find({ sessionId }).sort({ createdAt: -1 });
  }

  // Get active polls only
  static async getActivePollsInSession(sessionId: string): Promise<IPoll[]> {
    return Poll.find({ sessionId, active: true });
  }

  // Close poll (set active to false)
  static async closePoll(pollId: string): Promise<IPoll | null> {
    return Poll.findByIdAndUpdate(
      pollId,
      { active: false },
      { new: true }
    );
  }

  // Get poll statistics
  static async getPollStats(pollId: string) {
    const poll = await Poll.findById(pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    return poll.getStats();
  }

  // Mark correct answers
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

  // Get messages for a session
  static async getMessagesBySession(sessionId: string) {
    return ChatMessage.find({ sessionId }).sort({ timestamp: -1 }).limit(50);
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

export { PollService, ChatService };
