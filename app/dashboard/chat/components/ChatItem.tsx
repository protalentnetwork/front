'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive, Loader2 } from 'lucide-react';
import { ChatData, ChatTab } from '../types';

interface ChatItemProps {
  chat: ChatData;
  type: ChatTab;
  isSelected: boolean;
  isConnected: boolean;
  assigningChat: string | null;
  isAuthenticated: boolean;
  getUsernameById: (id: string | null) => string;
  onSelect: (userId: string) => void;
  onArchive: (userId: string) => void;
  onAssign: (userId: string, conversationId: string) => void;
}

export function ChatItem({
  chat,
  type,
  isSelected,
  isConnected,
  assigningChat,
  isAuthenticated,
  getUsernameById,
  onSelect,
  onArchive,
  onAssign
}: ChatItemProps) {
  return (
    <div
      onClick={() => onSelect(chat.chat_user_id)}
      className={`p-2 sm:p-3 md:p-4 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
        <div className="min-w-0">
          <h3 className="font-medium text-sm sm:text-base truncate">Usuario {chat.chat_user_id}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
            {type === 'archived' ? 'Chat archivado' : 'Chat en vivo'}
          </p>
        </div>
        <div className="flex flex-row sm:flex-col items-start sm:items-end flex-wrap gap-1 sm:gap-2">
          {type !== 'archived' && (
            <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-5">
              {isConnected ? 'Activo' : 'Desconectado'}
            </Badge>
          )}

          {type === 'active' && (
            <>
              <Badge variant="secondary" className="text-[10px] sm:text-xs py-0 h-5">
                Asignado a {getUsernameById(chat.chat_agent_id)}
              </Badge>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(chat.chat_user_id);
                }}
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs h-6 py-0"
              >
                <Archive className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Archivar</span>
                <span className="sm:hidden">Arch.</span>
              </Button>
            </>
          )}

          {type === 'pending' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  return;
                }

                if (chat.conversationId) {
                  onAssign(chat.chat_user_id, chat.conversationId);
                }
              }}
              variant="outline"
              size="sm"
              className="text-[10px] sm:text-xs h-6 py-0"
              disabled={!isAuthenticated || assigningChat === chat.chat_user_id || !chat.conversationId}
            >
              {assigningChat === chat.chat_user_id ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Asignando...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Asignarme</span>
                  <span className="sm:hidden">Asignar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 