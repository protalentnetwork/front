'use client';

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import ChatInput from './ChatInput';

const socket = io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
});

interface Message {
    id: string;
    userId: string;
    message: string;
    sender: string;
    agentId: string | null;
    timestamp: string;
}

interface ChatData {
    chat_user_id: string;
    chat_agent_id: string | null;
}

const ChatDashboard: React.FC = () => {
    const [activeChats, setActiveChats] = useState<ChatData[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const agentId = 'agent1';

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Conectado al servidor WebSocket');
            setIsLoading(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Error de conexión WebSocket:', err.message);
            setError(`Error de conexión: ${err.message}`);
            setIsLoading(false);
        });

        socket.on('disconnect', (reason) => {
            console.log('Desconectado del servidor WebSocket:', reason);
        });

        socket.emit('joinAgent', { agentId });

        socket.on('activeChats', (chats: ChatData[]) => {
            console.log('Chats activos recibidos:', chats);
            setActiveChats(Array.isArray(chats) ? chats : []);
            setIsLoading(false);
        });

        socket.on('messageHistory', (messages: Message[]) => {
            console.log('Historial de mensajes recibido:', messages);
            setMessages(Array.isArray(messages) ? messages : []);
        });

        socket.on('newMessage', (message: Message) => {
            console.log('Nuevo mensaje recibido:', message);
            if (selectedChat === message.userId) {
                setMessages((prev) => [...prev, message]);
            }
            setActiveChats((prev) => {
                if (!prev.some((chat) => chat.chat_user_id === message.userId)) {
                    return [...prev, { chat_user_id: message.userId, chat_agent_id: message.agentId || null }];
                }
                return prev;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('activeChats');
            socket.off('newMessage');
            socket.off('messageHistory');
        };
    }, [selectedChat, agentId]);

    const selectChat = (userId: string) => {
        console.log(`Seleccionando chat ${userId}`);
        setSelectedChat(userId);
        socket.emit('selectChat', { userId, agentId });
        socket.emit('joinChat', { userId });
    };

    const assignToMe = (userId: string) => {
        console.log(`Asignando chat ${userId} al agente ${agentId}`);
        socket.emit('assignAgent', { userId, agentId });
        selectChat(userId);
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <span className="text-gray-500">Loading chats...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <span className="text-red-500">Error: {error}</span>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-100px)]">
            <div className="w-1/3 border-r overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Chats Activos {activeChats.length > 0 && `(${activeChats.length})`}
                    </h2>
                    <div className="space-y-2">
                        {activeChats.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No hay chats activos en este momento</div>
                        ) : (
                            activeChats.map((chat) => (
                                <div
                                    key={chat.chat_user_id}
                                    onClick={() => selectChat(chat.chat_user_id)}
                                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedChat === chat.chat_user_id ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">Usuario {chat.chat_user_id}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Chat en vivo</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500">Activo</span>
                                            {chat.chat_agent_id ? (
                                                <span className="text-xs px-2 py-1 rounded mt-1 bg-green-100 text-green-800">
                                                    Asignado a {chat.chat_agent_id}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        assignToMe(chat.chat_user_id);
                                                    }}
                                                    className="text-xs px-2 py-1 rounded mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                >
                                                    Asignarme
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                {selectedChat ? (
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Chat con {selectedChat}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length > 0 ? (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'agent'
                                                    ? 'bg-blue-500 text-white ml-auto'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium mb-1">
                                                    {msg.sender === 'agent' ? 'Tú' : 'Cliente'}
                                                </span>
                                                <p className="break-words">{msg.message}</p>
                                                <span
                                                    className={`text-xs mt-1 ${msg.sender === 'agent'
                                                            ? 'text-blue-100'
                                                            : 'text-gray-500'
                                                        }`}
                                                >
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 text-center">
                                        No hay mensajes aún
                                    </p>
                                </div>
                            )}
                        </div>
                        <ChatInput
                            chatId={selectedChat}
                            agentId={agentId}
                            socket={socket}
                        />
                    </div>
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