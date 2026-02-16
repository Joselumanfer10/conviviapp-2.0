import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

let socket: Socket | null = null;

// Derivar URL del socket desde VITE_API_URL (ej: "http://localhost:3000/api" → "http://localhost:3000")
// En producción/Nginx usa window.location.origin ya que el proxy maneja /socket.io
function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl !== '/api') {
    try {
      const url = new URL(apiUrl);
      return url.origin;
    } catch {
      // URL relativa, usar origin
    }
  }
  return window.location.origin;
}

export function createSocket(): Socket {
  if (socket?.connected) return socket;

  const token = useAuthStore.getState().accessToken;

  socket = io(getSocketUrl(), {
    auth: { token },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
