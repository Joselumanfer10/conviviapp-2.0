import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { createSocket, disconnectSocket, getSocket } from '@/lib/socket';

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      setIsConnected(false);
      return;
    }

    const socket = createSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isAuthenticated, accessToken]);

  const joinHome = useCallback((homeId: string) => {
    getSocket()?.emit('home:join', homeId);
  }, []);

  const leaveHome = useCallback((homeId: string) => {
    getSocket()?.emit('home:leave', homeId);
  }, []);

  return { isConnected, joinHome, leaveHome };
}
