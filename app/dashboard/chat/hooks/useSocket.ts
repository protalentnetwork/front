import { useEffect, useState, useRef } from 'react';
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
  const hasEmittedRef = useRef(false);
  
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
    if (socket && isConnected && !hasEmittedRef.current) {
      console.log('Emitiendo eventos iniciales de chat');
      
      // Solicitar chats activos y archivados específicamente para la página de chat
      socket.emit('getActiveChats');
      socket.emit('getArchivedChats');
      
      // Solicitar usuarios conectados una sola vez al iniciar
      socket.emit('getConnectedUsers');
      
      // Marcar que ya se han emitido los eventos
      hasEmittedRef.current = true;
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected: !!socket && isConnected,
    isLoading,
    error
  };
}