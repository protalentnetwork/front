'use client';

import React, { useState, useEffect } from 'react';
import Chat from './chat';


interface ZendeskChat {
  id: string;
  visitor: {
    name: string;
    email: string;
  };
  status: string;
  timestamp: string;
  agent?: {
    name: string;
  };
}

const ChatDashboard = () => {
  const [activeChats, setActiveChats] = useState<ZendeskChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    const loadActiveChats = async () => {
      try {
        const response = await fetch('/api/zendesk/chats/active');
        const data = await response.json();
        setActiveChats(data);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    loadActiveChats();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadActiveChats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Lista de chats activos */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Chats Activos</h2>
          <div className="space-y-2">
            {activeChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedChat === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{chat.visitor.name || 'Visitante'}</h3>
                    <p className="text-sm text-gray-500">{chat.visitor.email}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      chat.status === 'online' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {chat.status}
                    </span>
                  </div>
                </div>
                {chat.agent && (
                  <div className="mt-2 text-sm text-gray-600">
                    Agente: {chat.agent.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat seleccionado */}
      <div className="flex-1">
        {selectedChat ? (
          <Chat chatId={selectedChat} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecciona un chat para comenzar
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;