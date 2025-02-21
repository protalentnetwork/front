'use client';

import React from 'react';
import ChatDashboard from './ChatDashboard';

export default function ChatPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Chats en Vivo</h1>
      <ChatDashboard />
    </div>
  );
}