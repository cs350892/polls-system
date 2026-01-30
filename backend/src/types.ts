// Types and interfaces for the application
export interface StudentVote {
  studentName: string;
  option: string;
}

export interface PollData {
  _id: string;
  question: string;
  options: string[];
  duration: number;
  startTime: Date;
  votes: StudentVote[];
  active: boolean;
  correctAnswers: string[];
  createdBy: string;
  sessionId: string;
}

export interface ChatData {
  _id: string;
  pollId: string;
  from: string;
  text: string;
  timestamp: Date;
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  name: string;
  createdBy: string;
  active: boolean;
  students: string[];
}

export interface SocketUser {
  socketId: string;
  studentName: string;
  sessionId: string;
}
