'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ChatInput from './ChatInput';

// Types
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

// Socket configuration
const socket = io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

export default function ChatDashboard() {
    // State
    const [activeChats, setActiveChats] = useState<ChatData[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const agentId = 'agent1'; // TODO: Get from auth context

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Socket event handlers
    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setIsLoading(false);
            setError(null);
            socket.emit('joinAgent', { agentId });
            toast.success('Conectado al servidor de chat');
        }

        function onDisconnect(reason: string) {
            setIsConnected(false);
            toast.error(`Se perdió la conexión con el servidor: ${reason}`);
        }

        function onConnectError(err: Error) {
            setError(`Error de conexión: ${err.message}`);
            setIsLoading(false);
            toast.error(`Error de conexión: ${err.message}`);
        }

        function onActiveChats(chats: ChatData[]) {
            setActiveChats(Array.isArray(chats) ? chats : []);
            setIsLoading(false);
        }

        function onMessageHistory(chatMessages: Message[]) {
            setMessages(Array.isArray(chatMessages) ? chatMessages : []);
        }

        function onNewMessage(message: Message) {
            if (selectedChat === message.userId) {
                setMessages(prev => [...prev, {
                    ...message,
                    id: nanoid()
                }]);
                scrollToBottom();
            }
            
            setActiveChats(prev => {
                if (!prev.some(chat => chat.chat_user_id === message.userId)) {
                    toast(`Nuevo mensaje de Usuario ${message.userId}`, {
                        description: message.message,
                    });
                    return [...prev, { chat_user_id: message.userId, chat_agent_id: message.agentId || null }];
                }
                return prev;
            });
        }

        // Socket event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('activeChats', onActiveChats);
        socket.on('messageHistory', onMessageHistory);
        socket.on('newMessage', onNewMessage);

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('activeChats', onActiveChats);
            socket.off('messageHistory', onMessageHistory);
            socket.off('newMessage', onNewMessage);
        };
    }, [selectedChat, scrollToBottom]);

    const selectChat = useCallback((userId: string) => {
        setSelectedChat(userId);
        socket.emit('selectChat', { userId, agentId });
        socket.emit('joinChat', { userId });
    }, [agentId]);

    const assignToMe = useCallback((userId: string) => {
        socket.emit('assignAgent', { userId, agentId });
        selectChat(userId);
    }, [agentId, selectChat]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button 
                        onClick={() => window.location.reload()}
                        variant="outline"
                    >
                        Reintentar conexión
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-180px)] gap-4">
            {/* Chat list */}
            <Card className="w-1/3">
                <ScrollArea className="h-full">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Chats Activos
                            </h2>
                            {activeChats.length > 0 && (
                                <Badge variant="secondary">
                                    {activeChats.length}
                                </Badge>
                            )}
                        </div>
                        <div className="space-y-2">
                            {activeChats.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay chats activos en este momento
                                </div>
                            ) : (
                                activeChats.map((chat) => (
                                    <div
                                        key={chat.chat_user_id}
                                        onClick={() => selectChat(chat.chat_user_id)}
                                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                                            selectedChat === chat.chat_user_id 
                                                ? 'bg-accent text-accent-foreground' 
                                                : 'hover:bg-muted'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">Usuario {chat.chat_user_id}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Chat en vivo
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {isConnected ? 'Activo' : 'Desconectado'}
                                                </Badge>
                                                {chat.chat_agent_id ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Asignado a {chat.chat_agent_id}
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            assignToMe(chat.chat_user_id);
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs"
                                                    >
                                                        Asignarme
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat messages */}
            <Card className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Chat con Usuario {selectedChat}
                                </h3>
                                <Badge variant={isConnected ? 'default' : 'destructive'}>
                                    {isConnected ? 'Conectado' : 'Desconectado'}
                                </Badge>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${
                                                    msg.sender === 'agent'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium mb-1">
                                                        {msg.sender === 'agent' ? 'Tú' : 'Cliente'}
                                                    </span>
                                                    <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                                                    <span className="text-xs mt-1 opacity-70">
                                                        {format(new Date(msg.timestamp), 'HH:mm', { locale: es })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No hay mensajes aún
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                        <ChatInput
                            chatId={selectedChat}
                            agentId={agentId}
                            socket={socket}
                        />
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Selecciona un chat para comenzar
                    </div>
                )}
            </Card>
        </div>
    );
}