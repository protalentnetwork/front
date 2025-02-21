'use client';

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Chat from './chat';

const socket = io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
});

interface Message {
    userId: string;
    sender: string;
    message: string;
    timestamp: Date;
}

interface ChatData {
    userId: string;
    agentId: string | null;
}

const ChatDashboard: React.FC = () => {
    const [activeChats, setActiveChats] = useState<ChatData[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const agentId = 'agent1'; // Temporal, reemplaza con JWT

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
            setActiveChats(chats);
            setIsLoading(false);
        });

        socket.on('newMessage', (message: Message) => {
            console.log('Nuevo mensaje recibido:', message);
            setActiveChats((prev) => {
                if (!prev.some((chat) => chat.userId === message.userId)) {
                    return [...prev, { userId: message.userId, agentId: null }];
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
        };
    }, [agentId]);

    const assignToMe = (userId: string) => {
        console.log(`Asignando chat ${userId} al agente ${agentId}`);
        socket.emit('assignAgent', { userId, agentId });
        setSelectedChat(userId);
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
                                    key={chat.userId}
                                    onClick={() => setSelectedChat(chat.userId)}
                                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedChat === chat.userId ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">Usuario {chat.userId}</h3>
                                            <p className="text-sm text-gray-600 mt-1">Chat en vivo</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500">Activo</span>
                                            {chat.agentId ? (
                                                <span className="text-xs px-2 py-1 rounded mt-1 bg-green-100 text-green-800">
                                                    Asignado a {chat.agentId}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        assignToMe(chat.userId);
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