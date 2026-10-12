import http from 'http';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import { env } from './config/env';

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(
  cors({
    origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(express.json());

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    game: 'Project Eleven: Agentic Football Arena',
    version: '1.0.0',
    timestamp: Date.now(),
    env: env.NODE_ENV,
    llmProvider: env.LLM_PROVIDER,
  });
});

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
  });
});

const PORT = env.PORT;
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`⚽ Project Eleven: Server running on port ${PORT}`);
  console.log(`📡 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`🌐 Allowed client origin: ${env.CLIENT_ORIGIN}`);
  console.log(`🤖 LLM Provider: ${env.LLM_PROVIDER}`);
  console.log('====================================================');
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] HTTP and Socket.IO server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
