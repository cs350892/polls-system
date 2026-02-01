import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import { handleSockets } from './sockets/PollSocketHandler';
import pollRoutes from './routes/pollRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGINS = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

app.use(
  cors({
    origin: CLIENT_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB();
handleSockets(io);
app.use('/api/polls', pollRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export { io, server, app };
