'use client';

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://backoffice-casino-back-production.up.railway.app'); // Ajusta según tu backend

interface Message {
  sender: string;
  message: string;
  timestamp: Date;
}

interface ChatProps {
  chatId: string;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.emit('joinChat', { userId: chatId });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('messageHistory', (history: Message[]) => {
      setMessages(history);
    });

    socket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('messageHistory');
      socket.off('message');
    };
  }, [chatId]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('clientMessage', { userId: chatId, message: input });
      setMessages((prev) => [...prev, { sender: 'me', message: input, timestamp: new Date() }]);
      setInput('');
    }
  };

  return (
    <div className="h-full relative">
      {isConnected ? (
        <div className="h-full flex flex-col">
          <div className="absolute top-0 left-0 p-4 bg-blue-100 rounded-md">
            Chat ID: {chatId}
          </div>
          <div className="flex-1 overflow-y-auto p-4 mt-16">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>{msg.sender === 'me' ? 'Tú' : 'Agente'}: </strong>
                {msg.message}{' '}
                <span className="text-xs text-gray-500">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="w-full p-2 border rounded"
              placeholder="Escribe un mensaje..."
            />
            <button
              onClick={sendMessage}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
            >
              Enviar
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          Conectando al chat...
        </div>
      )}
    </div>
  );
};

export default Chat;