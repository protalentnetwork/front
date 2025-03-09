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
  assigningChat: string | null;
  isAuthenticated: boolean;
  getUsernameById: (id: string | null) => string;
  onSelect: (userId: string) => void;
  onArchive: (userId: string) => void;
  onAssign: (userId: string, conversationId: string) => void;
  isUserConnected: (userId: string) => boolean;
}

export function ChatItem({
  chat,
  type,
  isSelected,
  assigningChat,
  isAuthenticated,
  getUsernameById,
  onSelect,
  onArchive,
  onAssign,
  isUserConnected
}: ChatItemProps) {
  const userIsConnected = isUserConnected(chat.chat_user_id);

  return (
    <div
      onClick={() => onSelect(chat.chat_user_id)}
      className={`p-2 sm:p-3 md:p-4 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
        }`}
    >
      <div className="flex flex-col gap-2">
        {/* Primera fila: Información del usuario */}
        <div className="flex justify-between items-start w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              {userIsConnected ? (
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              ) : (
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              <h3 className="font-medium text-sm sm:text-base truncate">Usuario {chat.chat_user_id}</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
              {type === 'archived' ? 'Chat archivado' : 'Chat en vivo'}
            </p>
          </div>

          {/* Estado de conexión */}
          {type !== 'archived' && (
            <Badge
              variant={userIsConnected ? "default" : "destructive"}
              className={`text-[10px] sm:text-xs py-0 h-5 flex items-center gap-1 flex-shrink-0 ${userIsConnected
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
            >
              {userIsConnected ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              {userIsConnected ? 'Activo' : 'Desconectado'}
            </Badge>
          )}
        </div>

        {/* Segunda fila: Badges y botones */}
        {(type === 'active' || type === 'pending') && (
          <div className="flex justify-between items-center w-full">
            {type === 'active' && (
              <>
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs py-0 h-5 whitespace-nowrap overflow-hidden border border-primary-foreground"
                >
                  <span className="truncate inline-block w-full">
                    Asignado a {getUsernameById(chat.chat_agent_id)}
                  </span>
                </Badge>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(chat.chat_user_id);
                  }}
                  variant="outline"
                  size="sm"
                  className="text-[10px] sm:text-xs h-6 py-0 ml-2 flex-shrink-0 border border-primary-foreground"
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
                variant="default"
                size="sm"
                className={`text-[10px] sm:text-xs h-6 py-0 w-fit border border-primary-foreground
                  ${isSelected ?
                    'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary' :
                    'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'}`}
                disabled={!isAuthenticated || assigningChat === chat.chat_user_id}
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
        )}
      </div>
    </div>
  );
}