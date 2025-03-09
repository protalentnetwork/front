'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { ChatData } from '../types';
import { useAuth } from '@/hooks/useAuth';

interface ChatHeaderProps {
  selectedChat: string | null;
  activeChats: ChatData[];
  onArchive: (userId: string) => void;
  isUserConnected: (userId: string) => boolean;
}

export function ChatHeader({
  selectedChat,
  activeChats,
  onArchive,
  isUserConnected
}: ChatHeaderProps) {
  const { user } = useAuth();
  if (!selectedChat) return null;

  // Verificar si el chat está activo
  const activeChat = activeChats.find(chat => chat.chat_user_id === selectedChat);
  const isActive = !!activeChat;

  // Verificar si el chat está asignado al agente actual
  const currentAgentId = user?.id;
  const isAssignedToCurrentAgent = activeChat?.chat_agent_id === currentAgentId;

  // Solo mostrar el botón de archivar si el chat está activo y asignado al agente actual
  const showArchiveButton = isActive && isAssignedToCurrentAgent;

  const connected = isUserConnected(selectedChat);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Chat con Usuario {selectedChat}
        </h3>
        <div className="flex items-center gap-2">
          <Badge
            variant={connected ? 'default' : 'destructive'}
            className={`text-[10px] sm:text-xs py-0 h-5 flex items-center gap-1 ${connected
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
          >
            {connected ? (
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2 w-2 mr-1">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {connected ? 'Conectado' : 'Desconectado'}
          </Badge>

          {showArchiveButton && (
            <Button
              onClick={() => onArchive(selectedChat)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Archive className="h-3 w-3 mr-1" />
              Archivar chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 