'use client';

import React from 'react';
import ChatDashboard from './ChatDashboard';

export default function ChatPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chats en Vivo</h1>
      </div>
      <ChatDashboard />
    </div>
  );
}