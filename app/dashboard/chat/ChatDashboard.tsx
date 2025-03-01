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
    conversationId?: string;
}

interface ChatData {
    chat_user_id: string;
    chat_agent_id: string | null;
    status?: 'active' | 'pending' | 'archived';
    conversationId?: string;
}

interface User {
    id: string;
    username: string;
    role: string;
    office: string;
    status: string;
    receivesWithdrawals: boolean;
    withdrawal?: string;
    createdAt: Date;
}

// Socket configuration
const socket = io('https://backoffice-casino-back-production.up.railway.app', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    forceNew: true,
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
    const [users, setUsers] = useState<User[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Obtener el ID del agente desde el contexto de autenticación
    const { user, isAuthenticated } = useAuth();
    const agentId = user?.id || 'guest';

    // Fetch users data
    const fetchUsers = useCallback(async () => {
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Error fetching users:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, []);

    // Get username by agent ID
    const getUsernameById = useCallback((id: string | null) => {
        if (!id) return 'Sin asignar';
        const foundUser = users.find(user => user.id === id);
        return foundUser ? foundUser.username : id;
    }, [users]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        // Fetch users on component mount
        fetchUsers();

        // Configurar un ping periódico para mantener la conexión activa
        const pingInterval = setInterval(() => {
            if (socket.connected) {
                console.log('Enviando ping al servidor...');
                socket.emit('checkConnection', (response: { status: string; timestamp: number }) => {
                    console.log('Respuesta de ping:', response);
                });
            }
        }, 30000); // Cada 30 segundos

        function onConnect() {
            setIsConnected(true);
            setIsLoading(false);
            setError(null);

            // Join as agent with more complete information
            socket.emit('joinAgent', {
                agentId,
                agentName: user?.name || 'Agente sin nombre',
                agentRole: user?.role || 'guest'
            });

            // Request current chats after connection
            socket.emit('getActiveChats');
            socket.emit('getArchivedChats');

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

        function onActiveChats(chats: { userId: string; agentId: string; conversationId: string }[]) {
            console.log('Recibiendo chats activos:', chats);
            const active: ChatData[] = [];
            const pending: ChatData[] = [];

            // Classify chats based on agent assignment
            if (Array.isArray(chats)) {
                chats.forEach(chat => {
                    // Map the new format (userId, agentId) to expected format (chat_user_id, chat_agent_id)
                    const mappedChat: ChatData = {
                        chat_user_id: chat.userId,
                        chat_agent_id: chat.agentId,
                        conversationId: chat.conversationId
                    };

                    if (mappedChat.chat_agent_id) {
                        active.push({
                            ...mappedChat,
                            status: 'active'
                        });
                    } else {
                        pending.push({
                            ...mappedChat,
                            status: 'pending'
                        });
                    }
                });
            }
            setActiveChats(active);
            setPendingChats(pending);
            setIsLoading(false);
        }

        // Add a listener for chat assignment confirmation
        function onAgentAssigned(data: { userId: string; agentId: string; success: boolean; conversationId: string }) {
            console.log('Agente asignado:', data);
            if (data.success && data.agentId === agentId) {
                if (assigningChat !== data.userId) {
                    socket.emit('getActiveChats');
                }

                // Si estamos viendo esta conversación, unirse a la sala
                if (selectedChat === data.userId) {
                    socket.emit('selectConversation', {
                        conversationId: data.conversationId,
                        agentId
                    });
                }
            }
        }

        // Add a listener for chat assignment failure
        function onAssignmentError(error: { message: string }) {
            console.error('Assignment error:', error);
            toast.error(`Error de asignación: ${error.message}`);
        }

        function onArchivedChats(chats: { userId: string; agentId: string; conversationId: string }[]) {
            console.log('Recibiendo chats archivados:', chats);
            if (Array.isArray(chats)) {
                const mapped = chats.map(chat => ({
                    chat_user_id: chat.userId,
                    chat_agent_id: chat.agentId,
                    conversationId: chat.conversationId,
                    status: 'archived' as const
                }));
                setArchivedChats(mapped);
            } else {
                setArchivedChats([]);
            }
        }

        function onMessageHistory(chatMessages: Message[]) {
            console.log('Recibiendo historial de mensajes:', chatMessages);
            if (Array.isArray(chatMessages)) {
                // Asegurar que todos los mensajes históricos tengan IDs únicos
                const messagesWithIds = chatMessages.map(msg => ({
                    ...msg,
                    id: msg.id || nanoid()
                }));
                setMessages(messagesWithIds);
                scrollToBottom();
            } else {
                setMessages([]);
            }
        }

        function onConversationMessages(data: { conversationId: string; messages: Message[] }) {
            console.log('Recibiendo mensajes de conversación:', data);
            if (Array.isArray(data.messages)) {
                const messagesWithIds = data.messages.map(msg => ({
                    ...msg,
                    id: msg.id || nanoid()
                }));
                setMessages(messagesWithIds);

                // Store the conversation ID when receiving messages
                if (data.conversationId) {
                    setCurrentConversationId(data.conversationId);
                }

                scrollToBottom();
            } else {
                setMessages([]);
            }
        }

        function onNewMessage(message: Message) {
            console.log('Nuevo mensaje recibido:', message);
            const isForCurrentChat = selectedChat === message.userId ||
                    (message.conversationId && message.conversationId === currentConversationId);

            if (isForCurrentChat) {
                console.log('Nuevo mensaje recibido para el chat actual:', message);
                setMessages(prevMessages => {
                    // Verificar si el mensaje ya existe para evitar duplicados
                    const messageExists = prevMessages.some(
                        msg => msg.id === message.id || 
                        (msg.message === message.message && 
                         msg.sender === message.sender && 
                         Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 3000)
                    );

                    if (messageExists) {
                        console.log('Mensaje duplicado detectado, no se añadirá:', message);
                        return prevMessages;
                    }

                    const newMessage = {
                        ...message,
                        id: message.id || nanoid()
                    };

                    return [...prevMessages, newMessage];
                });

                // Actualizar la lista de chats activos
                socket.emit('getActiveChats');
                
                // Notificar visualmente al agente
                if (message.sender === 'client') {
                    toast.info(`Nuevo mensaje de ${message.userId}`, {
                        description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '')
                    });
                }

                scrollToBottom();
            } else {
                // Si el mensaje no es para el chat actual, solo actualizar la lista de chats
                socket.emit('getActiveChats');
                
                // Notificar al agente sobre el nuevo mensaje en otro chat
                if (message.sender === 'client') {
                    toast.info(`Nuevo mensaje en otro chat de ${message.userId}`, {
                        description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '')
                    });
                }
            }
        }

        // Función para manejar cambios en el estado de conexión
        function onConnectionStatus(data: { type: string; id: string; status: string }) {
            console.log('Estado de conexión actualizado:', data);
            // Actualizar la UI si es necesario
        }

        // Función para manejar pings del servidor
        function onPing() {
            console.log('Ping recibido del servidor');
            // Responder con un pong para mantener la conexión activa
            socket.emit('pong');
        }

        // Registrar los event listeners
        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);
        socket.on('activeChats', onActiveChats);
        socket.on('archivedChats', onArchivedChats);
        socket.on('messageHistory', onMessageHistory);
        socket.on('conversationMessages', onConversationMessages);
        socket.on('newMessage', onNewMessage);
        socket.on('message', onNewMessage); // También escuchar el evento 'message'
        socket.on('agentAssigned', onAgentAssigned);
        socket.on('assignmentError', onAssignmentError);
        socket.on('connectionStatus', onConnectionStatus);
        socket.on('ping', onPing);

        // Solicitar chats activos y archivados al conectar
        if (socket.connected) {
            socket.emit('getActiveChats');
            socket.emit('getArchivedChats');
        }

        // Cleanup function
        return () => {
            clearInterval(pingInterval);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('activeChats', onActiveChats);
            socket.off('archivedChats', onArchivedChats);
            socket.off('messageHistory', onMessageHistory);
            socket.off('conversationMessages', onConversationMessages);
            socket.off('newMessage', onNewMessage);
            socket.off('message', onNewMessage);
            socket.off('agentAssigned', onAgentAssigned);
            socket.off('assignmentError', onAssignmentError);
            socket.off('connectionStatus', onConnectionStatus);
            socket.off('ping', onPing);
        };
    }, [selectedChat, currentConversationId, scrollToBottom, agentId, fetchUsers, user, assigningChat]);

    // Efecto para volver a unirse a la sala de conversación cuando cambia currentConversationId
    useEffect(() => {
        if (currentConversationId && socket.connected) {
            console.log(`Uniendo al agente a la sala de conversación ${currentConversationId}`);
            socket.emit('selectConversation', {
                conversationId: currentConversationId,
                agentId
            });
        }
    }, [currentConversationId, agentId]);

    const selectChat = useCallback((userId: string) => {
        // Clear current messages when selecting a new chat
        setMessages([]);
        setSelectedChat(userId);
        setCurrentConversationId(null); // Reset conversationId when changing chats

        // Find the conversation ID for this user from active or pending chats
        const activeChat = activeChats.find(chat => chat.chat_user_id === userId);
        const pendingChat = pendingChats.find(chat => chat.chat_user_id === userId);
        const archivedChat = archivedChats.find(chat => chat.chat_user_id === userId);

        // Get the conversation ID from whichever chat was found
        const conversationId = activeChat?.conversationId || pendingChat?.conversationId || archivedChat?.conversationId;

        if (conversationId) {
            // Store the conversation ID in state
            setCurrentConversationId(conversationId);

            // Emit the selectConversation event with the correct payload structure
            socket.emit('selectConversation', {
                conversationId,
                agentId
            });
        } else {
            // If conversation ID is not found in our local state, request it from the server
            socket.emit('getConversationId', { userId }, (response: { success: boolean; conversationId?: string; error?: string }) => {
                if (response && response.success && response.conversationId) {
                    // Update our state with the conversationId we got from the server
                    setCurrentConversationId(response.conversationId);
                    
                    // Also update our local chat lists to include this conversationId
                    setActiveChats(prev => {
                        const chatIndex = prev.findIndex(chat => chat.chat_user_id === userId);
                        if (chatIndex >= 0) {
                            const updatedChats = [...prev];
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                conversationId: response.conversationId
                            };
                            return updatedChats;
                        }
                        return prev;
                    });
                    
                    setPendingChats(prev => {
                        const chatIndex = prev.findIndex(chat => chat.chat_user_id === userId);
                        if (chatIndex >= 0) {
                            const updatedChats = [...prev];
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                conversationId: response.conversationId
                            };
                            return updatedChats;
                        }
                        return prev;
                    });
                    
                    setArchivedChats(prev => {
                        const chatIndex = prev.findIndex(chat => chat.chat_user_id === userId);
                        if (chatIndex >= 0) {
                            const updatedChats = [...prev];
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                conversationId: response.conversationId
                            };
                            return updatedChats;
                        }
                        return prev;
                    });
                    
                    // Now that we have the conversationId, emit the selectConversation event
                    socket.emit('selectConversation', {
                        conversationId: response.conversationId,
                        agentId
                    });
                } else {
                    const errorMessage = response?.error || 'No se encontró una conversación activa para este usuario';
                    console.error('Error al obtener ID de conversación:', errorMessage);
                    
                    toast.error('No se puede cargar esta conversación', {
                        description: errorMessage,
                        duration: 5000
                    });
                }
            });
        }
    }, [activeChats, pendingChats, archivedChats, agentId]);

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
                // Store the conversation ID
                setCurrentConversationId(conversationId);
                // Move chat from pending to active
                setPendingChats(prev => prev.filter(chat => chat.chat_user_id !== userId));

                // First check if the chat already exists in activeChats
                setActiveChats(prev => {
                    // Check if this chat already exists in the active chats
                    const existingChatIndex = prev.findIndex(chat => chat.chat_user_id === userId);

                    // If it exists, update it
                    if (existingChatIndex >= 0) {
                        const updatedChats = [...prev];
                        updatedChats[existingChatIndex] = {
                            chat_user_id: userId,
                            chat_agent_id: agentId,
                            status: 'active',
                            conversationId
                        };
                        return updatedChats;
                    }

                    // If it doesn't exist, add it
                    return [
                        ...prev,
                        {
                            chat_user_id: userId,
                            chat_agent_id: agentId,
                            status: 'active',
                            conversationId
                        }
                    ];
                });

                // Switch to active tab and select the chat
                setSelectedTab('active');
                selectChat(userId);

                toast.success(`Chat asignado correctamente a ${user.name}`);
            } else {
                const errorMessage = response?.error || 'Error desconocido al asignar el chat';
                console.error('Error al asignar chat:', errorMessage);
                toast.error(`Error al asignar el chat: ${errorMessage}`);
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
                                    Asignado a {getUsernameById(chat.chat_agent_id)}
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
                                        const loadingToast = toast.loading('Buscando información de chat...');

                                        socket.emit('getConversationId', { userId: chat.chat_user_id }, (response: { success: boolean; conversationId?: string; error?: string }) => {
                                            toast.dismiss(loadingToast);

                                            if (response && response.success && response.conversationId) {
                                                chat.conversationId = response.conversationId;

                                                assignToMe(chat.chat_user_id, response.conversationId);
                                            } else {
                                                const errorMessage = response?.error || 'No se encontró una conversación activa para este usuario';
                                                console.error('Error al obtener ID de conversación:', errorMessage);

                                                toast.error('No se puede asignar este chat', {
                                                    description: `${errorMessage}. Las conversaciones se crean cuando un usuario inicia un chat, no se pueden crear manualmente.`,
                                                    duration: 8000
                                                });
                                            }
                                        });
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

    const sendMessage = useCallback((message: string) => {
        if (!selectedChat || !currentConversationId || !message.trim()) {
            return;
        }

        console.log(`Enviando mensaje a ${selectedChat} en conversación ${currentConversationId}`);

        // Crear un mensaje temporal para UI optimista
        const tempMessage: Message = {
            id: nanoid(),
            userId: selectedChat,
            message: message.trim(),
            sender: 'agent',
            agentId,
            timestamp: new Date().toISOString(),
            conversationId: currentConversationId
        };

        // Actualizar UI inmediatamente
        setMessages(prev => [...prev, tempMessage]);

        // Enviar mensaje al servidor
        socket.emit('message', {
            userId: selectedChat,
            message: message.trim(),
            agentId,
            conversationId: currentConversationId
        }, (response: { success: boolean; message?: string }) => {
            console.log('Respuesta del servidor:', response);
            if (!response.success) {
                toast.error(`Error al enviar mensaje: ${response.message || 'Error desconocido'}`);
            }
        });

        // Scroll al final
        scrollToBottom();
    }, [selectedChat, currentConversationId, agentId, scrollToBottom]);

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
                        {/* Chat Input */}
                        {selectedChat && (
                          activeChats.some(chat => chat.chat_user_id === selectedChat) ? (
                            <ChatInput
                              chatId={selectedChat}
                              socket={socket}
                              conversationId={currentConversationId || undefined}
                              onSendMessage={sendMessage}
                            />
                          ) : (
                            <div className="p-4 border-t bg-muted/50 text-center text-sm">
                              {archivedChats.some(chat => chat.chat_user_id === selectedChat)
                                ? 'Este chat está archivado'
                                : 'Asígnate este chat para poder enviar mensajes'}
                            </div>
                          )
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