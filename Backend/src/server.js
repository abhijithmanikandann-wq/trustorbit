import app from './app.js';
import { connectDatabase } from './config/db.js';
import http from 'http';
import { initializeChatSocket } from './realtime/chatSocket.js';

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    initializeChatSocket(server);
    server.listen(port, () => console.log(`TrustOrbit API running at http://localhost:${port}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
