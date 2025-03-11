import React from 'react';
import { Button } from '@/components/ui/button';

interface ChatConnectionErrorProps {
  error?: string | null;
}

/**
 * Componente para mostrar errores de conexión con el servidor de chat
 */
export function ChatConnectionError({ error }: ChatConnectionErrorProps) {
  return (
    <div className="flex h-[calc(100vh-180px)] items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">{error || 'No se pudo conectar al servidor de chat'}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Reintentar conexión
        </Button>
      </div>
    </div>
  );
} 