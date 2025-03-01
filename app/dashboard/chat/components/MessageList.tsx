'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { Message, MessageEndRef } from '../types';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: MessageEndRef;
}

export function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No hay mensajes aún
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 