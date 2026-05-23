import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let socket = null;
const listeners = new Map();

export const connectSocket = (token) => {
  if (!token) return null;

  if (socket?.connected || socket?.active) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
  });

  listeners.forEach((handler, event) => {
    socket.off(event);
    socket.on(event, handler);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const onSocketEvent = (event, handler) => {
  listeners.set(event, handler);

  if (socket) {
    socket.off(event);
    socket.on(event, handler);
  }

  return () => {
    listeners.delete(event);
    socket?.off(event, handler);
  };
};

export const joinContestRoom = (contestId) => {
  if (contestId) {
    socket?.emit('contest:joinRoom', contestId);
  }
};

export const leaveContestRoom = (contestId) => {
  if (contestId) {
    socket?.emit('contest:leaveRoom', contestId);
  }
};
