'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Clock, MessageSquare } from 'lucide-react';
import { ChatItem } from './ChatItem';
import { ChatData, ChatTab } from '../types';
import { toast } from 'sonner';

interface ChatListProps {
  activeChats: ChatData[];
  pendingChats: ChatData[];
  archivedChats: ChatData[];
  selectedChat: string | null;
  selectedTab: ChatTab;
  isConnected: boolean;
  assigningChat: string | null;
  isAuthenticated: boolean;
  getUsernameById: (id: string | null) => string;
  setSelectedTab: (tab: ChatTab) => void;
  selectChat: (userId: string) => void;
  assignToMe: (userId: string, conversationId: string) => void;
  archiveChat: (userId: string) => void;
}

export function ChatList({
  activeChats,
  pendingChats,
  archivedChats,
  selectedChat,
  selectedTab,
  isConnected,
  assigningChat,
  isAuthenticated,
  getUsernameById,
  setSelectedTab,
  selectChat,
  assignToMe,
  archiveChat
}: ChatListProps) {
  const handleAssignToMe = (userId: string, conversationId: string) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para asignarte un chat');
      return;
    }
    
    assignToMe(userId, conversationId);
  };

  const renderChatList = (chats: ChatData[], type: ChatTab) => {
    if (chats.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {type === 'active' && 'No hay chats activos en este momento'}
          {type === 'pending' && 'No hay chats pendientes en este momento'}
          {type === 'archived' && 'No hay chats archivados en este momento'}
        </div>
      );
    }

    return chats.map((chat) => (
      <ChatItem
        key={chat.chat_user_id}
        chat={chat}
        type={type}
        isSelected={selectedChat === chat.chat_user_id}
        isConnected={isConnected}
        assigningChat={assigningChat}
        isAuthenticated={isAuthenticated}
        getUsernameById={getUsernameById}
        onSelect={selectChat}
        onArchive={archiveChat}
        onAssign={handleAssignToMe}
      />
    ));
  };

  return (
    <Card className="w-full md:w-1/3 mb-2 sm:mb-4 md:mb-0 overflow-hidden">
      <Tabs defaultValue="active" value={selectedTab} onValueChange={(value) => setSelectedTab(value as ChatTab)} className="h-full flex flex-col overflow-hidden">
        <div className="p-2 sm:p-4 sm:pb-0">
          <TabsList className="w-full min-w-0 grid grid-cols-3 p-1 h-auto">
            <TabsTrigger
              value="active"
              className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
            >
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden md:inline ml-1 truncate">Activos</span>
              {activeChats.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                  {activeChats.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden md:inline ml-1 truncate">Pendientes</span>
              {pendingChats.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                  {pendingChats.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
            >
              <Archive className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden md:inline ml-1 truncate">Archivados</span>
              {archivedChats.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                  {archivedChats.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-2 sm:px-4 pt-2">
          <TabsContent value="active" className="mt-2 space-y-2">
            {renderChatList(activeChats, 'active')}
          </TabsContent>
          <TabsContent value="pending" className="mt-2 space-y-2">
            {renderChatList(pendingChats, 'pending')}
          </TabsContent>
          <TabsContent value="archived" className="mt-2 space-y-2">
            {renderChatList(archivedChats, 'archived')}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
} 