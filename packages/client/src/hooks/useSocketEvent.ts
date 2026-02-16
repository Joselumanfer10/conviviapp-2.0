import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocketEvent<T = unknown>(
  eventName: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const listener = (data: T) => handlerRef.current(data);

    socket.on(eventName, listener);
    return () => {
      socket.off(eventName, listener);
    };
  }, [eventName]);
}
