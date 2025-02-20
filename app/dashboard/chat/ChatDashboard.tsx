'use client';

import React, { useState, useEffect } from 'react';
import Chat from './chat';

interface ZendeskChat {
    id: string;
    visitor: { name: string; email: string };
    status: string;
    timestamp: string;
    agent?: { id: string; name: string };
    lastMessage: string;
}

const ChatDashboard = () => {
    const [activeChats, setActiveChats] = useState<ZendeskChat[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Asegúrate de que esta URL coincida con tu backend en Railway
    const API_URL = 'https://backoffice-casino-back-production.up.railway.app';

    useEffect(() => {
        const loadActiveChats = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(`${API_URL}/zendesk/chat/chats`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        // Eliminamos credentials: 'include' si no estamos usando cookies
                    }
                });

                if (!response.ok) {
                    console.error('Error en la respuesta:', response.status, response.statusText);
                    throw new Error(`Error en la petición: ${response.status}`);
                }

                const data: ZendeskChat[] = await response.json();
                setActiveChats(data.filter(chat => chat.status === 'active'));
            } catch (error) {
                console.error('Error detallado:', error);
                setError(error instanceof Error ? error.message : 'Error al cargar los chats');
            } finally {
                setIsLoading(false);
            }
        };

        loadActiveChats();
        const interval = setInterval(loadActiveChats, 30000);
        return () => clearInterval(interval);
    }, []);

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
                            activeChats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat.id)}
                                    className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedChat === chat.id ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium">{chat.visitor.name || 'Visitante'}</h3>
                                            <p className="text-sm text-gray-500">{chat.visitor.email}</p>
                                            <p className="text-sm text-gray-600 mt-1 truncate">{chat.lastMessage}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-500">
                                                {new Date(chat.timestamp).toLocaleTimeString()}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-1 rounded mt-1 ${chat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {chat.status}
                                            </span>
                                        </div>
                                    </div>
                                    {chat.agent && (
                                        <div className="mt-2 text-sm text-gray-600 flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                            Agente: {chat.agent.name}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                {selectedChat ? (
                    <Chat chatId={selectedChat} /> // Pasamos el selectedChat como chatId
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