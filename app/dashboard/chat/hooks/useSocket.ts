import { useEffect, useState } from 'react';
import { useSocket as useGlobalSocket } from '@/lib/SocketContext';
import { Socket } from 'socket.io-client';
interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSocket(): UseSocketReturn {
  const { socket, isConnected } = useGlobalSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Actualizar estado de carga basado en la disponibilidad del socket
    if (socket) {
      setIsLoading(false);
      setError(null);
    } else {
      // Establecer un temporizador para mostrar error si el socket no se conecta después de un tiempo
      const timer = setTimeout(() => {
        if (!socket) {
          setError('No se pudo conectar al servidor de chat');
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [socket]);
  
  useEffect(() => {
    // Inicialización específica de la página de chat
    if (socket && isConnected) {
      // Solicitar chats activos y archivados específicamente para la página de chat
      socket.emit('getActiveChats');
      socket.emit('getArchivedChats');
      socket.emit('getConnectedUsers');
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected: !!socket && isConnected,
    isLoading,
    error
  };
}