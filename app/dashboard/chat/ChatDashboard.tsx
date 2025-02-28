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
import { Loader2, Archive, Clock, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInput from './ChatInput';
import { useAuth } from '@/hooks/useAuth';

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
    status?: 'active' | 'pending' | 'archived';
    conversationId?: string;
}

// Socket configuration
const socket = io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
});

export default function ChatDashboard() {
    const [activeChats, setActiveChats] = useState<ChatData[]>([]);
    const [pendingChats, setPendingChats] = useState<ChatData[]>([]);
    const [archivedChats, setArchivedChats] = useState<ChatData[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>('active');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [assigningChat, setAssigningChat] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Obtener el ID del agente desde el contexto de autenticación
    const { user, isAuthenticated } = useAuth();
    const agentId = user?.id || 'guest'; // Usar el ID del usuario autenticado o 'guest' como fallback
    const agentName = user?.name || 'Agente'; // Use for display purposes

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
            setIsLoading(false);
            setError(null);
            console.log('Socket conectado correctamente. ID:', socket.id);
            console.log('Socket transport:', socket.io.engine.transport.name);
            console.log('¿Socket está conectado?', socket.connected);

            // Join as agent with more complete information
            socket.emit('joinAgent', { 
                agentId,
                agentName: user?.name || 'Agente sin nombre',
                agentRole: user?.role || 'guest' 
            });

            // Usamos setTimeout para evitar problemas de actualización de estado
            setTimeout(() => {
                toast.success('Conectado al servidor de chat');
            }, 100);
        }

        // Añadir manejo de errores de conexión
        function onConnectError(error: Error) {
            console.error('Error de conexión socket:', error);
            setError(`Error de conexión: ${error.message}`);
            setIsLoading(false);

            setTimeout(() => {
                toast.error(`Error de conexión: ${error.message}`);
            }, 100);
        }

        function onDisconnect(reason: string) {
            setIsConnected(false);

            // Usamos setTimeout para evitar problemas de actualización de estado
            setTimeout(() => {
                toast.error(`Se perdió la conexión con el servidor: ${reason}`);
            }, 100);
        }

        function onActiveChats(chats: ChatData[]) {
            const active: ChatData[] = [];
            const pending: ChatData[] = [];

            // Classify chats based on agent assignment
            if (Array.isArray(chats)) {
                chats.forEach(chat => {
                    if (chat.chat_agent_id) {
                        active.push({ 
                            ...chat, 
                            status: 'active',
                            conversationId: chat.conversationId
                        });
                    } else {
                        pending.push({ 
                            ...chat, 
                            status: 'pending',
                            conversationId: chat.conversationId
                        });
                    }
                });
            }
            console.log('Chats activos:', active);
            console.log('Chats pendientes:', pending);

            setActiveChats(active);
            setPendingChats(pending);
            setIsLoading(false);
        }

        // Add a listener for chat assignment confirmation
        function onAgentAssigned(data: { userId: string; agentId: string; success: boolean }) {
            if (data.success && data.agentId === agentId) {
                console.log('Chat assigned successfully:', data);
                // You may want to refresh the chat lists here if needed
                socket.emit('getActiveChats');
            }
        }

        // Add a listener for chat assignment failure
        function onAssignmentError(error: { message: string }) {
            console.error('Assignment error:', error);
            toast.error(`Error de asignación: ${error.message}`);
        }

        function onArchivedChats(chats: ChatData[]) {
            setArchivedChats(Array.isArray(chats) ? chats.map(chat => ({ ...chat, status: 'archived' })) : []);
        }

        function onMessageHistory(chatMessages: Message[]) {
            setMessages(Array.isArray(chatMessages) ? chatMessages : []);
        }

        function onNewMessage(message: Message) {
            console.log('Mensaje nuevo recibido:', message);
            if (selectedChat === message.userId) {
                setMessages(prev => [...prev, {
                    ...message,
                    id: message.id || nanoid()
                }]);
                scrollToBottom();
            }
            
            // Actualizar las listas de chats cuando llega un mensaje nuevo
            const isInActiveChats = activeChats.some(chat => chat.chat_user_id === message.userId);
            const isInPendingChats = pendingChats.some(chat => chat.chat_user_id === message.userId);
            
            if (!isInActiveChats && !isInPendingChats) {
                // Si el chat no existe en ninguna lista, añadirlo a pendientes
                if (!message.agentId) {
                    setPendingChats(prev => [
                        ...prev, 
                        { 
                            chat_user_id: message.userId, 
                            chat_agent_id: null,
                            status: 'pending'
                        }
                    ]);
                    
                    toast(`Nuevo chat pendiente de Usuario ${message.userId}`, {
                        description: message.message,
                    });
                }
            }
        }

        // Socket event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('activeChats', onActiveChats);
        socket.on('archivedChats', onArchivedChats);
        socket.on('messageHistory', onMessageHistory);
        socket.on('newMessage', onNewMessage);
        socket.on('agentAssigned', onAgentAssigned);
        socket.on('assignmentError', onAssignmentError);

        // Solicitar chats activos y archivados al conectar
        if (socket.connected) {
            socket.emit('getActiveChats');
            socket.emit('getArchivedChats');
        }

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('activeChats', onActiveChats);
            socket.off('archivedChats', onArchivedChats);
            socket.off('messageHistory', onMessageHistory);
            socket.off('newMessage', onNewMessage);
            socket.off('agentAssigned', onAgentAssigned);
            socket.off('assignmentError', onAssignmentError);
        };
    }, [selectedChat, scrollToBottom, agentId, activeChats, pendingChats]);

    const selectChat = useCallback((userId: string) => {
        setSelectedChat(userId);
        socket.emit('selectChat', { userId, agentId });
        socket.emit('joinChat', { userId });
    }, [agentId]);

    const assignToMe = useCallback((userId: string, conversationId: string) => {
        // Show loading toast and set loading state
        const loadingToast = toast.loading('Asignando chat...');
        setAssigningChat(userId);
        
        // Make sure we have a valid agent ID from the current user
        if (!isAuthenticated || !user?.id) {
            toast.dismiss(loadingToast);
            setAssigningChat(null);
            toast.error('No se pudo asignar el chat: Usuario no autenticado');
            return;
        }

        // Emit assignAgent event
        socket.emit('assignAgent', { 
            userId, 
            agentId, 
            conversationId,
            agentName: user.name 
        }, (response: { success: boolean; error?: string }) => {
            toast.dismiss(loadingToast);
            setAssigningChat(null);
            
            if (response && response.success) {
                // Move chat from pending to active
                setPendingChats(prev => prev.filter(chat => chat.chat_user_id !== userId));
                setActiveChats(prev => [
                    ...prev,
                    {
                        chat_user_id: userId,
                        chat_agent_id: agentId,
                        status: 'active',
                        conversationId
                    }
                ]);
                
                // Switch to active tab and select the chat
                setSelectedTab('active');
                selectChat(userId);
                
                toast.success(`Chat asignado correctamente a ${user.name}`);
            } else {
                toast.error(`Error al asignar el chat: ${response?.error || 'Error desconocido'}`);
            }
        });
    }, [agentId, selectChat, isAuthenticated, user]);

    const archiveChat = useCallback((userId: string) => {
        socket.emit('archiveChat', { userId, agentId });

        // Mover el chat a archivados
        setActiveChats(prev => prev.filter(chat => chat.chat_user_id !== userId));
        setArchivedChats(prev => [
            ...prev,
            {
                chat_user_id: userId,
                chat_agent_id: agentId,
                status: 'archived'
            }
        ]);

        if (selectedChat === userId) {
            setSelectedChat(null);
        }

        toast.success(`Chat con Usuario ${userId} archivado correctamente`);
    }, [agentId, selectedChat]);

    const renderChatList = (chats: ChatData[], type: 'active' | 'pending' | 'archived') => {
        if (chats.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    {type === 'active' && 'No hay chats activos en este momento'}
                    {type === 'pending' && 'No hay chats pendientes en este momento'}
                    {type === 'archived' && 'No hay chats archivados en este momento'}
                </div>
            );
        }

        return chats.map((chat) => (
            <div
                key={chat.chat_user_id}
                onClick={() => selectChat(chat.chat_user_id)}
                className={`p-2 sm:p-3 md:p-4 rounded-lg cursor-pointer transition-colors ${selectedChat === chat.chat_user_id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                    <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">Usuario {chat.chat_user_id}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                            {type === 'archived' ? 'Chat archivado' : 'Chat en vivo'}
                        </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end flex-wrap gap-1 sm:gap-2">
                        {type !== 'archived' && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs py-0 h-5">
                                {isConnected ? 'Activo' : 'Desconectado'}
                            </Badge>
                        )}

                        {type === 'active' && (
                            <>
                                <Badge variant="secondary" className="text-[10px] sm:text-xs py-0 h-5">
                                    Asignado a {chat.chat_agent_id}
                                </Badge>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        archiveChat(chat.chat_user_id);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] sm:text-xs h-6 py-0"
                                >
                                    <Archive className="h-3 w-3 mr-1" />
                                    <span className="hidden sm:inline">Archivar</span>
                                    <span className="sm:hidden">Arch.</span>
                                </Button>
                            </>
                        )}

                        {type === 'pending' && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isAuthenticated) {
                                        toast.error('Debes iniciar sesión para asignarte un chat');
                                        return;
                                    }
                                    
                                    if (chat.conversationId) {
                                        assignToMe(chat.chat_user_id, chat.conversationId);
                                    } else {
                                        toast.error('No se pudo asignar el chat: ID de conversación no disponible');
                                    }
                                }}
                                variant="outline"
                                size="sm"
                                className="text-[10px] sm:text-xs h-6 py-0"
                                disabled={!isAuthenticated || assigningChat === chat.chat_user_id}
                            >
                                {assigningChat === chat.chat_user_id ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        <span className="hidden sm:inline">Asignando...</span>
                                        <span className="sm:hidden">...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Asignarme</span>
                                        <span className="sm:hidden">Asignar</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

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
        <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] gap-2 sm:gap-4">
            {/* Chat list with tabs */}
            <Card className="w-full md:w-1/3 mb-2 sm:mb-4 md:mb-0 overflow-hidden">
                <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col overflow-hidden">
                    <div className="p-2 sm:p-4 sm:pb-0">
                        <TabsList className="w-full min-w-0 grid grid-cols-3 p-1 h-auto">
                            <TabsTrigger
                                value="active"
                                className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
                            >
                                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="hidden md:inline ml-1 truncate">Activos</span>
                                {activeChats.length > 0 && (
                                    <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                                        {activeChats.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
                            >
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="hidden md:inline ml-1 truncate">Pendientes</span>
                                {pendingChats.length > 0 && (
                                    <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                                        {pendingChats.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="archived"
                                className="flex items-center justify-center gap-0.5 py-1.5 px-0.5 sm:px-1 md:px-2 text-xs sm:text-sm overflow-hidden"
                            >
                                <Archive className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="hidden md:inline ml-1 truncate">Archivados</span>
                                {archivedChats.length > 0 && (
                                    <Badge variant="secondary" className="ml-0.5 text-[10px] px-1 min-w-0 h-4 flex items-center justify-center">
                                        {archivedChats.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 px-2 sm:px-4 pt-2">
                        <TabsContent value="active" className="mt-2 space-y-2">
                            {renderChatList(activeChats, 'active')}
                        </TabsContent>
                        <TabsContent value="pending" className="mt-2 space-y-2">
                            {renderChatList(pendingChats, 'pending')}
                        </TabsContent>
                        <TabsContent value="archived" className="mt-2 space-y-2">
                            {renderChatList(archivedChats, 'archived')}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
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
                                <div className="flex items-center gap-2">
                                    <Badge variant={isConnected ? 'default' : 'destructive'}>
                                        {isConnected ? 'Conectado' : 'Desconectado'}
                                    </Badge>

                                    {activeChats.some(chat => chat.chat_user_id === selectedChat) && (
                                        <Button
                                            onClick={() => archiveChat(selectedChat)}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            <Archive className="h-3 w-3 mr-1" />
                                            Archivar chat
                                        </Button>
                                    )}
                                </div>
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
                                                className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'agent'
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
                        {/* Solo mostrar el input de mensaje si el chat está activo */}
                        {activeChats.some(chat => chat.chat_user_id === selectedChat) ? (
                            <ChatInput
                                chatId={selectedChat}
                                agentId={agentId}
                                socket={socket}
                            />
                        ) : (
                            <div className="p-4 border-t bg-muted/50 text-center text-sm">
                                {archivedChats.some(chat => chat.chat_user_id === selectedChat)
                                    ? 'Este chat está archivado'
                                    : 'Asígnate este chat para poder enviar mensajes'}
                            </div>
                        )}
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