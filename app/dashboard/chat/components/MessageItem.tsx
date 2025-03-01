'use client';

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          message.sender === 'agent'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium mb-1">
            {message.sender === 'agent' ? 'Tú' : 'Cliente'}
          </span>
          <p className="break-words whitespace-pre-wrap">{message.message}</p>
          <span className="text-xs mt-1 opacity-70">
            {format(new Date(message.timestamp), 'HH:mm', { locale: es })}
          </span>
        </div>
      </div>
    </div>
  );
} 