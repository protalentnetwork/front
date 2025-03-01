'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { ChatData } from '../types';

interface ChatHeaderProps {
  selectedChat: string | null;
  isConnected: boolean;
  activeChats: ChatData[];
  onArchive: (userId: string) => void;
}

export function ChatHeader({ 
  selectedChat, 
  isConnected, 
  activeChats,
  onArchive 
}: ChatHeaderProps) {
  if (!selectedChat) return null;

  const isActive = activeChats.some(chat => chat.chat_user_id === selectedChat);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Chat con Usuario {selectedChat}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>

          {isActive && (
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