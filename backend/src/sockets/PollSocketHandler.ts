import { Server, Socket } from 'socket.io';
import { PollService, ChatService } from '../services/PollService';

type Role = 'teacher' | 'student';

interface Participant {
  name: string;
  role: Role;
  sessionId: string;
}

const connectedUsers = new Map<string, Participant>();
const pollTimers = new Map<string, NodeJS.Timeout>();

const getParticipants = (sessionId: string) => {
  return Array.from(connectedUsers.entries())
    .filter(([, user]) => user.sessionId === sessionId)
    .map(([socketId, user]) => ({ socketId, name: user.name, role: user.role }));
};

const broadcastParticipants = (io: Server, sessionId: string) => {
  io.to(sessionId).emit('participantsUpdate', {
    participants: getParticipants(sessionId),
  });
};

const startPollTimer = (
  io: Server,
  sessionId: string,
  pollId: string,
  duration: number
) => {
  const existing = pollTimers.get(pollId);
  if (existing) {
    clearInterval(existing);
  }

  let remainingTime = duration;

  io.to(sessionId).emit('timerUpdate', { pollId, remainingTime });

  const interval = setInterval(async () => {
    remainingTime -= 1;

    io.to(sessionId).emit('timerUpdate', { pollId, remainingTime });

    if (remainingTime <= 0) {
      clearInterval(interval);
      pollTimers.delete(pollId);

      try {
        await PollService.endPoll(pollId);
        const results = await PollService.getResults(pollId);

        io.to(sessionId).emit('pollEnded', {
          pollId,
          results,
        });
      } catch (error) {
        console.error('Failed to end poll:', error);
      }
    }
  }, 1000);

  pollTimers.set(pollId, interval);
};

const handleSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on(
      'join',
      async (payload: { sessionId: string; role: Role; studentName?: string }) => {
        try {
          const { sessionId, role, studentName } = payload;

          if (!sessionId || !role) {
            socket.emit('error', { message: 'Invalid join payload' });
            return;
          }

          const name = (studentName || 'teacher').toLowerCase().trim();

          if (role === 'student' && !name) {
            socket.emit('error', { message: 'Student name is required' });
            return;
          }

          const duplicate = Array.from(connectedUsers.values()).some(
            (user) =>
              user.sessionId === sessionId &&
              user.role === 'student' &&
              user.name === name
          );

          if (duplicate) {
            socket.emit('error', { message: 'Student name already taken' });
            return;
          }

          connectedUsers.set(socket.id, { name, role, sessionId });
          socket.join(sessionId);

          broadcastParticipants(io, sessionId);

          const activePoll = await PollService.getCurrentPoll(sessionId);

          if (activePoll) {
            socket.emit('pollStarted', {
              poll: activePoll.poll,
              remainingTime: activePoll.remainingTime,
            });

            socket.emit('timerUpdate', {
              pollId: activePoll.poll._id.toString(),
              remainingTime: activePoll.remainingTime,
            });
          } else {
            const history = await PollService.getHistory(sessionId);

            if (history.length > 0) {
              const lastPoll = history[0];
              const results = await PollService.getResults(
                lastPoll._id.toString()
              );

              socket.emit('pollEnded', {
                pollId: lastPoll._id.toString(),
                results,
              });
            }
          }
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    socket.on(
      'createPoll',
      async (payload: {
        sessionId: string;
        question: string;
        options: string[];
        duration: number;
        createdBy: string;
      }) => {
        try {
          const user = connectedUsers.get(socket.id);

          if (!user || user.role !== 'teacher') {
            socket.emit('error', { message: 'Only teacher can create poll' });
            return;
          }

          const { sessionId, question, options, duration, createdBy } = payload;

          const poll = await PollService.createPoll(
            question,
            options,
            duration,
            createdBy,
            sessionId
          );

          startPollTimer(io, sessionId, poll._id.toString(), duration);

          io.to(sessionId).emit('pollStarted', {
            poll,
            remainingTime: duration,
          });
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    socket.on(
      'submitVote',
      async (payload: {
        pollId: string;
        sessionId: string;
        studentName: string;
        option: string;
      }) => {
        try {
          const user = connectedUsers.get(socket.id);

          if (!user || user.role !== 'student') {
            socket.emit('error', { message: 'Only students can vote' });
            return;
          }

          const { pollId, sessionId, studentName, option } = payload;

          const { poll, results } = await PollService.submitVote(
            pollId,
            studentName,
            option
          );

          io.to(sessionId).emit('voteUpdate', {
            pollId,
            results,
            totalVotes: poll.votes.length,
          });
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    socket.on(
      'sendMessage',
      async (payload: {
        pollId: string;
        sessionId: string;
        from: string;
        text: string;
      }) => {
        try {
          const { pollId, sessionId, from, text } = payload;

          const message = await ChatService.saveMessage(
            pollId,
            from,
            text,
            sessionId
          );

          io.to(sessionId).emit('newMessage', {
            pollId,
            from: message.from,
            text: message.text,
            timestamp: message.timestamp,
          });
        } catch (error: any) {
          socket.emit('error', { message: error.message });
        }
      }
    );

    socket.on(
      'kickStudent',
      (payload: { sessionId: string; targetSocketId: string }) => {
        const user = connectedUsers.get(socket.id);

        if (!user || user.role !== 'teacher') {
          socket.emit('error', { message: 'Only teacher can kick' });
          return;
        }

        const { sessionId, targetSocketId } = payload;
        const target = connectedUsers.get(targetSocketId);

        if (!target || target.sessionId !== sessionId) {
          socket.emit('error', { message: 'Student not found in session' });
          return;
        }

        io.to(targetSocketId).emit('kicked', {
          message: 'You were removed by the teacher',
        });

        connectedUsers.delete(targetSocketId);
        io.sockets.sockets.get(targetSocketId)?.leave(sessionId);

        broadcastParticipants(io, sessionId);
      }
    );

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);

      if (user) {
        connectedUsers.delete(socket.id);
        broadcastParticipants(io, user.sessionId);
      }

      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};

export { handleSockets };
