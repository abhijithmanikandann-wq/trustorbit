import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';
import {
  createChatNotification,
  createContractMessage,
  getChatRecipient,
  getContractForUser
} from '../services/chatService.js';

const userSockets = new Map();
const contractViewers = new Map();

function addToSetMap(map, key, value) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function removeFromSetMap(map, key, value) {
  const values = map.get(key);
  if (!values) return;
  values.delete(value);
  if (values.size === 0) map.delete(key);
}

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function getTokenFromRequest(request) {
  const url = new URL(request.url, 'http://localhost');
  const authHeader = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return url.searchParams.get('token') || authHeader;
}

function getViewerKey(contractId, userId) {
  return `${contractId}:${userId}`;
}

async function authenticateSocket(request) {
  const token = getTokenFromRequest(request);
  if (!token) throw new Error('Authentication token is required.');
  return jwt.verify(token, process.env.JWT_SECRET);
}

function isUserInContractChat(contractId, userId) {
  return contractViewers.has(getViewerKey(contractId, userId));
}

export function isUserActiveInContractChat(contractId, userId) {
  return isUserInContractChat(contractId, userId);
}

export function notifyUserSockets(userId, payload, exceptContractId) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  for (const socket of sockets) {
    if (exceptContractId && socket.currentContractId === exceptContractId) continue;
    sendJson(socket, payload);
  }
}

export function broadcastToContractChat(contractId, payload) {
  for (const socket of userSockets.values()) {
    for (const userSocket of socket) {
      if (userSocket.currentContractId === contractId) sendJson(userSocket, payload);
    }
  }
}

export function initializeChatSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', async (socket, request) => {
    try {
      socket.user = await authenticateSocket(request);
      socket.currentContractId = null;
      addToSetMap(userSockets, socket.user.id, socket);

      sendJson(socket, { type: 'connected', userId: socket.user.id });
    } catch {
      sendJson(socket, { type: 'error', message: 'Invalid or expired authentication token.' });
      socket.close(1008, 'Unauthorized');
      return;
    }

    socket.on('message', async (rawMessage) => {
      try {
        const data = JSON.parse(rawMessage.toString());

        if (data.type === 'join_chat') {
          const contract = await getContractForUser(data.contractId, socket.user.id);
          if (!contract) throw new Error('Contract not found.');

          if (socket.currentContractId) {
            removeFromSetMap(contractViewers, getViewerKey(socket.currentContractId, socket.user.id), socket);
          }

          socket.currentContractId = data.contractId;
          addToSetMap(contractViewers, getViewerKey(data.contractId, socket.user.id), socket);
          sendJson(socket, { type: 'joined_chat', contractId: data.contractId });
          return;
        }

        if (data.type === 'leave_chat') {
          if (socket.currentContractId) {
            removeFromSetMap(contractViewers, getViewerKey(socket.currentContractId, socket.user.id), socket);
            sendJson(socket, { type: 'left_chat', contractId: socket.currentContractId });
            socket.currentContractId = null;
          }
          return;
        }

        if (data.type === 'send_message') {
          const body = data.body?.trim();
          if (!data.contractId || !body) throw new Error('contractId and body are required.');

          const contract = await getContractForUser(data.contractId, socket.user.id);
          if (!contract) throw new Error('Contract not found.');

          const message = await createContractMessage(data.contractId, socket.user.id, body);
          const recipientId = getChatRecipient(contract, socket.user.id);

          broadcastToContractChat(data.contractId, { type: 'message_created', message });

          if (!isUserInContractChat(data.contractId, recipientId)) {
            const notification = await createChatNotification(recipientId);
            notifyUserSockets(recipientId, { type: 'notification_created', notification }, data.contractId);
          }
        }
      } catch (error) {
        sendJson(socket, { type: 'error', message: error.message || 'Chat action failed.' });
      }
    });

    socket.on('close', () => {
      removeFromSetMap(userSockets, socket.user.id, socket);
      if (socket.currentContractId) {
        removeFromSetMap(contractViewers, getViewerKey(socket.currentContractId, socket.user.id), socket);
      }
    });
  });

  console.log('TrustOrbit chat WebSocket ready at /ws/chat');
  return wss;
}
