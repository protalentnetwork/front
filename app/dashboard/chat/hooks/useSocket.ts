import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Socket configuration
const createSocket = (): Socket => {
  return io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
  });
};

interface UseSocketProps {
  agentId: string;
  agentName?: string | null;
  agentRole?: string | null;
}

interface UseSocketReturn {
  socket: Socket;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSocket({ agentId, agentName = 'Agente sin nombre', agentRole = 'guest' }: UseSocketProps): UseSocketReturn {
  const [socket] = useState<Socket>(() => createSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setIsLoading(false);
      setError(null);

      // Join as agent with more complete information
      socket.emit('joinAgent', {
        agentId,
        agentName: agentName || 'Agente sin nombre',
        agentRole: agentRole || 'guest'
      });

      // Request current chats after connection
      socket.emit('getActiveChats');
      socket.emit('getArchivedChats');

      socket.emit('getConnectedUsers');
      
      setTimeout(() => {
        toast.success('Conectado al servidor de chat');
      }, 100);
    }

    function onConnectError(error: Error) {
      console.error('Error de conexión socket:', error);
      setError(`Error de conexión: ${error.message}`);
      setIsLoading(false);

      setTimeout(() => {
        toast.error(`Error de conexión: ${error.message}`);
      }, 100);
    }

    function onDisconnect(reason: string) {
      setIsConnected(false);

      setTimeout(() => {
        toast.error(`Se perdió la conexión con el servidor: ${reason}`);
      }, 100);
    }

    function onPing() {
      socket.emit('pong');
    }

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.on('ping', onPing);

    // Periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('checkConnection');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.off('ping', onPing);
    };
  }, [socket, agentId, agentName, agentRole]);

  return {
    socket,
    isConnected,
    isLoading,
    error
  };
} 