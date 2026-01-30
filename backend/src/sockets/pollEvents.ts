import { Socket, Server } from 'socket.io';
import { PollService, ChatService } from './PollService';

// Map to store poll timers: pollId -> intervalId
const pollTimers = new Map<string, NodeJS.Timeout>();

// Initialize socket event handlers
const initializeSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ User connected:', socket.id);

    // Join a session
    socket.on('joinSession', (sessionId: string, studentName: string) => {
      socket.join(sessionId);
      console.log(`${studentName} joined session ${sessionId}`);

      // Notify others
      socket.to(sessionId).emit('userJoined', {
        message: `${studentName} joined`,
        studentName,
      });
    });

    // Get current active poll
    socket.on('getActivePoll', async (sessionId: string) => {
      try {
        const result = await PollService.getCurrentPoll(sessionId);

        if (result) {
          socket.emit('pollActive', {
            poll: result.poll,
            remainingTime: result.remainingTime,
          });
        } else {
          socket.emit('noPollActive');
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch active poll' });
      }
    });

    // Create a new poll
    socket.on(
      'createPoll',
      async (
        sessionId: string,
        question: string,
        options: string[],
        duration: number,
        createdBy: string
      ) => {
        try {
          const poll = await PollService.createPoll(
            question,
            options,
            duration,
            createdBy,
            sessionId
          );

          // Start timer for this poll
          startPollTimer(io, sessionId, poll._id.toString(), duration);

          // Broadcast to all in session
          io.to(sessionId).emit('newPoll', {
            poll,
            remainingTime: duration,
          });

          console.log(`📊 New poll created: ${poll._id}`);
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    // Submit a vote
    socket.on(
      'submitVote',
      async (
        pollId: string,
        sessionId: string,
        studentName: string,
        option: string
      ) => {
        try {
          const { poll, results } = await PollService.submitVote(
            pollId,
            studentName,
            option
          );

          // Broadcast updated results to all in session
          io.to(sessionId).emit('voteSubmitted', {
            pollId,
            studentName,
            option,
            results,
            totalVotes: poll.votes.length,
          });

          socket.emit('voteSuccess', { message: 'Vote submitted' });
          console.log(`✅ Vote submitted for poll ${pollId}`);
        } catch (error: any) {
          socket.emit('voteError', { message: error.message });
        }
      }
    );

    // Get poll results
    socket.on('getResults', async (pollId: string) => {
      try {
        const results = await PollService.getResults(pollId);
        socket.emit('pollResults', results);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Get poll history
    socket.on('getHistory', async (sessionId: string) => {
      try {
        const history = await PollService.getHistory(sessionId);
        socket.emit('pollHistory', history);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Send chat message
    socket.on(
      'sendMessage',
      async (
        pollId: string,
        sessionId: string,
        from: string,
        text: string
      ) => {
        try {
          const message = await ChatService.saveMessage(
            pollId,
            from,
            text,
            sessionId
          );

          // Broadcast to all in session
          io.to(sessionId).emit('newMessage', {
            from: message.from,
            text: message.text,
            timestamp: message.timestamp,
          });

          console.log(`💬 Message from ${from}: ${text}`);
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};

// Start a timer for a poll
const startPollTimer = (
  io: Server,
  sessionId: string,
  pollId: string,
  duration: number
) => {
  // Clear existing timer if any
  if (pollTimers.has(pollId)) {
    clearInterval(pollTimers.get(pollId));
  }

  let remainingTime = duration;

  // Broadcast remaining time every second
  const interval = setInterval(async () => {
    remainingTime--;

    io.to(sessionId).emit('pollTimerUpdate', {
      pollId,
      remainingTime,
    });

    // End poll when time expires
    if (remainingTime <= 0) {
      clearInterval(interval);
      pollTimers.delete(pollId);

      try {
        await PollService.endPoll(pollId);
        const results = await PollService.getResults(pollId);

        io.to(sessionId).emit('pollEnded', {
          pollId,
          results,
          message: 'Poll has ended',
        });

        console.log(`⏰ Poll ${pollId} ended`);
      } catch (error) {
        console.error('Error ending poll:', error);
      }
    }
  }, 1000);

  pollTimers.set(pollId, interval);
};

// Cleanup: Clear all timers on server shutdown
const cleanupTimers = () => {
  pollTimers.forEach((interval) => clearInterval(interval));
  pollTimers.clear();
  console.log('🧹 Cleared all poll timers');
};

export { initializeSocketHandlers, cleanupTimers };
