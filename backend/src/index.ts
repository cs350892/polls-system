import express from 'express';
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
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Vite default port
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Socket.IO event handlers
handleSockets(io);

// API Routes
app.use('/api/polls', pollRoutes);

// Basic routes
app.get('/health', (req, res) => {
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
