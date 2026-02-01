import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type Role = 'teacher' | 'student';

export interface Poll {
  _id: string;
  question: string;
  options: string[];
  duration: number;
  startTime: string | Date;
  active: boolean;
  correctAnswers?: string[];
}

export interface VotePercentage {
  option: string;
  votes: number;
  percentage: number;
}

export interface PollResults {
  pollId: string;
  question: string;
  options: VotePercentage[];
  totalVotes: number;
  correctAnswers: string[];
}

export interface ChatMessage {
  pollId: string;
  from: string;
  text: string;
  timestamp: string | Date;
}

export interface Participant {
  socketId: string;
  name: string;
  role: Role;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const currentPollRef = useRef<Poll | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [results, setResults] = useState<PollResults | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isKicked, setIsKicked] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    currentPollRef.current = currentPoll;
  }, [currentPoll]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server', socket.id);
    });

    socket.on('pollStarted', (payload: { poll: Poll; remainingTime: number }) => {
      setCurrentPoll(payload.poll);
      setRemainingTime(payload.remainingTime);
      setResults(null);
    });

    socket.on('timerUpdate', (payload: { pollId: string; remainingTime: number }) => {
      setRemainingTime(payload.remainingTime);
    });

    socket.on('voteUpdate', (payload: { pollId: string; results: VotePercentage[] }) => {
      const poll = currentPollRef.current;

      if (poll && payload.pollId === poll._id) {
        setResults({
          pollId: poll._id,
          question: poll.question,
          options: payload.results,
          totalVotes: payload.results.reduce((acc, item) => acc + item.votes, 0),
          correctAnswers: poll.correctAnswers || [],
        });
      }
    });

    socket.on('pollEnded', (payload: { pollId: string; results: PollResults }) => {
      setResults(payload.results);
      setCurrentPoll(null);
      setRemainingTime(0);
    });

    socket.on('newMessage', (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    });

    socket.on('participantsUpdate', (payload: { participants: Participant[] }) => {
      setParticipants(payload.participants);
    });

    socket.on('kicked', () => {
      setIsKicked(true);
    });

    socket.on('error', (payload: { message?: string }) => {
      setLastError(payload?.message || 'Something went wrong');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const join = (sessionId: string, role: Role, studentName?: string) => {
    socketRef.current?.emit('join', { sessionId, role, studentName });
  };

  const createPoll = (
    sessionId: string,
    question: string,
    options: string[],
    duration: number,
    createdBy: string
  ) => {
    socketRef.current?.emit('createPoll', {
      sessionId,
      question,
      options,
      duration,
      createdBy,
    });
  };

  const submitVote = (
    pollId: string,
    sessionId: string,
    studentName: string,
    option: string
  ) => {
    socketRef.current?.emit('submitVote', {
      pollId,
      sessionId,
      studentName,
      option,
    });
  };

  const sendMessage = (pollId: string, sessionId: string, from: string, text: string) => {
    socketRef.current?.emit('sendMessage', { pollId, sessionId, from, text });
  };

  const kickStudent = (sessionId: string, targetSocketId: string) => {
    socketRef.current?.emit('kickStudent', { sessionId, targetSocketId });
  };

  const clearError = () => {
    setLastError(null);
  };

  return {
    socket: socketRef.current,
    currentPoll,
    remainingTime,
    results,
    messages,
    participants,
    isKicked,
    lastError,
    join,
    createPoll,
    submitVote,
    sendMessage,
    kickStudent,
    clearError,
  };
};

export default useSocket;
