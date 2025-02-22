'use client';

import React from 'react';
import { Toaster } from 'sonner';
import ChatDashboard from './ChatDashboard';

export default function ChatPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chats en Vivo</h1>
      </div>
      <ChatDashboard />
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}