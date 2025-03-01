'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import ChatInput from '../ChatInput';
import { Message, ChatData, MessageEndRef } from '../types';
import { Socket } from 'socket.io-client';

interface ChatPanelProps {
  selectedChat: string | null;
  isConnected: boolean;
  activeChats: ChatData[];
  archivedChats: ChatData[];
  messages: Message[];
  messagesEndRef: MessageEndRef;
  currentConversationId: string | null;
  socket: Socket;
  onSendMessage: (message: string) => void;
  onArchive: (userId: string) => void;
}

export function ChatPanel({
  selectedChat,
  isConnected,
  activeChats,
  archivedChats,
  messages,
  messagesEndRef,
  currentConversationId,
  socket,
  onSendMessage,
  onArchive
}: ChatPanelProps) {
  const isActive = activeChats.some(chat => chat.chat_user_id === selectedChat);
  const isArchived = archivedChats.some(chat => chat.chat_user_id === selectedChat);

  return (
    <Card className="flex-1 flex flex-col">
      {selectedChat ? (
        <>
          <ChatHeader
            selectedChat={selectedChat}
            isConnected={isConnected}
            activeChats={activeChats}
            onArchive={onArchive}
          />
          <MessageList messages={messages} messagesEndRef={messagesEndRef} />
          {selectedChat && (
            isActive ? (
              <ChatInput
                chatId={selectedChat}
                socket={socket}
                conversationId={currentConversationId || undefined}
                onSendMessage={onSendMessage}
              />
            ) : (
              <div className="p-4 border-t bg-muted/50 text-center text-sm">
                {isArchived
                  ? 'Este chat está archivado'
                  : 'Asígnate este chat para poder enviar mensajes'}
              </div>
            )
          )}
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Selecciona un chat para comenzar
        </div>
      )}
    </Card>
  );
} 