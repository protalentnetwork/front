'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useChatState } from './hooks/useChatState';
import { useMessages } from './hooks/useMessages';
import { ChatList } from './components/ChatList';
import { ChatPanel } from './components/ChatPanel';
import { Socket } from 'socket.io-client';
export default function ChatDashboard() {
  // Get authentication context
  const { user, isAuthenticated } = useAuth();
  const agentId = user?.id || 'guest';

  // Initialize socket connection
  const { socket, isConnected, isLoading, error } = useSocket();

  const {
    activeChats,
    pendingChats,
    archivedChats,
    selectedChat,
    selectedTab,
    currentConversationId,
    assigningChat,
    setSelectedTab,
    selectChat,
    assignToMe,
    archiveChat,
    unarchiveChat,
    getUsernameById,
    isUserConnected
  } = useChatState({
    socket: socket as Socket,
    agentId,
    isConnected,
    agentName: user?.name
  });

  // Initialize messages
  const {
    messages,
    sendMessage,
    messagesEndRef,
  } = useMessages({
    socket: socket as Socket,
    selectedChat,
    currentConversationId,
    agentId
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !socket) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
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

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] gap-2 sm:gap-4">
      <ChatList
        activeChats={activeChats}
        pendingChats={pendingChats}
        archivedChats={archivedChats}
        selectedChat={selectedChat}
        selectedTab={selectedTab}
        assigningChat={assigningChat}
        isAuthenticated={isAuthenticated}
        getUsernameById={getUsernameById}
        setSelectedTab={setSelectedTab}
        selectChat={selectChat}
        assignToMe={assignToMe}
        archiveChat={archiveChat}
        unarchiveChat={unarchiveChat}
        isUserConnected={isUserConnected}
      />

      <ChatPanel
        selectedChat={selectedChat}
        activeChats={activeChats}
        archivedChats={archivedChats}
        messages={messages}
        messagesEndRef={messagesEndRef}
        currentConversationId={currentConversationId}
        socket={socket}
        onSendMessage={sendMessage}
        onArchive={archiveChat}
        isUserConnected={isUserConnected}
      />
    </div>
  );
}