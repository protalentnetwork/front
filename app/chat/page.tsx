'use client';

import React from 'react';
import ChatCliente from '../dashboard/chat/chatCliente';

const ClientChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ChatCliente chatId="user123" /> {/* Cambia el chatId según el usuario */}
    </div>
  );
};

export default ClientChatPage;