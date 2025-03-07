import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { ChatData, User, ChatTab } from '../types';

interface UseChatStateProps {
  socket: Socket;
  agentId: string;
  isConnected: boolean;
  agentName?: string | null;
}

interface UseChatStateReturn {
  activeChats: ChatData[];
  pendingChats: ChatData[];
  archivedChats: ChatData[];
  selectedChat: string | null;
  selectedTab: ChatTab;
  currentConversationId: string | null;
  assigningChat: string | null;
  users: User[];
  setSelectedChat: (userId: string | null) => void;
  setSelectedTab: (tab: ChatTab) => void;
  selectChat: (userId: string) => void;
  assignToMe: (userId: string, conversationId: string) => void;
  archiveChat: (userId: string) => void;
  getUsernameById: (id: string | null) => string;
  connectedUsers: Set<string>;
  isUserConnected: (userId: string) => boolean;
}

export function useChatState({ socket, agentId, agentName }: UseChatStateProps): UseChatStateReturn {
  const [activeChats, setActiveChats] = useState<ChatData[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [pendingChats, setPendingChats] = useState<ChatData[]>([]);
  const [archivedChats, setArchivedChats] = useState<ChatData[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<ChatTab>('active');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [assigningChat, setAssigningChat] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

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

  const getUsernameById = useCallback((id: string | null) => {
    if (!id) return 'Sin asignar';
    const foundUser = users.find(user => user.id === id);
    return foundUser ? foundUser.username : id;
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!socket) return;

    function onActiveChats(chats: { userId: string; agentId: string; conversationId: string }[]) {
      const active: ChatData[] = [];
      const pending: ChatData[] = [];

      if (Array.isArray(chats)) {
        chats.forEach(chat => {
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
    }

    function onArchivedChats(chats: { userId: string; agentId: string; conversationId: string }[]) {
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

    function onAgentAssigned(data: { userId: string; agentId: string; success: boolean; conversationId: string }) {
      if (data.success && data.agentId === agentId) {
        if (assigningChat !== data.userId) {
          socket.emit('getActiveChats');
        }

        if (selectedChat === data.userId) {
          socket.emit('selectConversation', {
            conversationId: data.conversationId,
            agentId
          });
        }
      }
    }

    function onAssignmentError(error: { message: string }) {
      console.error('Assignment error:', error);
      toast.error(`Error de asignación: ${error.message}`);
    }

    function onConnectionStatus(data: { type: 'user' | 'agent', id: string, status: 'connected' | 'disconnected' }) {
      if (data.type === 'user') {
        setConnectedUsers(prev => {
          const newSet = new Set(prev);
          if (data.status === 'connected') {
            newSet.add(data.id);
          } else {
            newSet.delete(data.id);
          }
          return newSet;
        });
      }
    }

    socket.on('activeChats', onActiveChats);
    socket.on('archivedChats', onArchivedChats);
    socket.on('agentAssigned', onAgentAssigned);
    socket.on('assignmentError', onAssignmentError);
    socket.on('connectionStatus', onConnectionStatus);

    if (socket.connected) {
      socket.emit('getActiveChats');
      socket.emit('getArchivedChats');
    }

    return () => {
      socket.off('activeChats', onActiveChats);
      socket.off('archivedChats', onArchivedChats);
      socket.off('agentAssigned', onAgentAssigned);
      socket.off('assignmentError', onAssignmentError);
      socket.off('connectionStatus', onConnectionStatus);
    };
  }, [socket, agentId, assigningChat, selectedChat]);

  useEffect(() => {
    if (currentConversationId && socket.connected) {
      socket.emit('selectConversation', {
        conversationId: currentConversationId,
        agentId
      });
    }
  }, [currentConversationId, agentId, socket]);

  const selectChat = useCallback((userId: string) => {
    setSelectedChat(userId);
    setCurrentConversationId(null);

    const activeChat = activeChats.find(chat => chat.chat_user_id === userId);
    const pendingChat = pendingChats.find(chat => chat.chat_user_id === userId);
    const archivedChat = archivedChats.find(chat => chat.chat_user_id === userId);

    const conversationId = activeChat?.conversationId || pendingChat?.conversationId || archivedChat?.conversationId;

    if (conversationId) {
      setCurrentConversationId(conversationId);

      socket.emit('selectConversation', {
        conversationId,
        agentId
      });
    } else {
      socket.emit('getConversationId', { userId }, (response: { success: boolean; conversationId?: string; error?: string }) => {
        if (response && response.success && response.conversationId) {
          setCurrentConversationId(response.conversationId);

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
  }, [activeChats, pendingChats, archivedChats, agentId, socket]);

  const assignToMe = useCallback((userId: string, conversationId: string) => {
    const loadingToast = toast.loading('Asignando chat...');
    setAssigningChat(userId);

    socket.emit('assignAgent', {
      userId,
      agentId,
      conversationId,
      agentName: agentName || 'Agente'
    }, (response: { success: boolean; error?: string }) => {
      toast.dismiss(loadingToast);
      setAssigningChat(null);

      if (response && response.success) {
        setCurrentConversationId(conversationId);
        setPendingChats(prev => prev.filter(chat => chat.chat_user_id !== userId));

        setActiveChats(prev => {
          const existingChatIndex = prev.findIndex(chat => chat.chat_user_id === userId);

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

        setSelectedTab('active');
        selectChat(userId);

        toast.success(`Chat asignado correctamente a ${agentName || 'Agente'}`);
      } else {
        const errorMessage = response?.error || 'Error desconocido al asignar el chat';
        console.error('Error al asignar chat:', errorMessage);
        toast.error(`Error al asignar el chat: ${errorMessage}`);
      }
    });
  }, [agentId, selectChat, socket, agentName]);

  const archiveChat = useCallback((userId: string) => {
    socket.emit('archiveChat', { userId, agentId });

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
  }, [agentId, selectedChat, socket]);

  const isUserConnected = useCallback((userId: string) => {
    return connectedUsers.has(userId);
  }, [connectedUsers]);

  return {
    activeChats,
    pendingChats,
    archivedChats,
    selectedChat,
    selectedTab,
    currentConversationId,
    assigningChat,
    users,
    setSelectedChat,
    setSelectedTab,
    selectChat,
    assignToMe,
    archiveChat,
    getUsernameById,
    connectedUsers,
    isUserConnected
  };
} 