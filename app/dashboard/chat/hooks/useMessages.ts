import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { Message, MessageEndRef } from '../types';

interface UseMessagesProps {
  socket: Socket;
  selectedChat: string | null;
  currentConversationId: string | null;
  agentId: string;
}

interface UseMessagesReturn {
  messages: Message[];
  sendMessage: (message: string) => void;
  messagesEndRef: MessageEndRef;
  scrollToBottom: () => void;
}

export function useMessages({ 
  socket, 
  selectedChat, 
  currentConversationId, 
  agentId 
}: UseMessagesProps): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recentNotifications = useRef<Map<string, number>>(new Map());

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Clear messages when changing chats
    if (selectedChat) {
      setMessages([]);
    }
  }, [selectedChat]);

  // Prevent duplicate toast notifications
  const showToastNotification = useCallback((message: Message) => {
    const messageKey = `${message.userId}-${message.message.substring(0, 20)}-${new Date(message.timestamp).getTime()}`;
    const now = Date.now();
    
    if (!recentNotifications.current.has(messageKey) || 
        now - (recentNotifications.current.get(messageKey) || 0) > 2000) {
      
      recentNotifications.current.set(messageKey, now);
      
      // Clean up old notifications
      for (const [key, timestamp] of recentNotifications.current.entries()) {
        if (now - timestamp > 10000) {
          recentNotifications.current.delete(key);
        }
      }
      
      if (message.sender === 'client') {
        const isForCurrentChat = selectedChat === message.userId ||
          (message.conversationId && message.conversationId === currentConversationId);
          
        if (isForCurrentChat) {
          toast.info(`Nuevo mensaje de ${message.userId}`, {
            description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '')
          });
        } else {
          toast.info(`Nuevo mensaje en otro chat de ${message.userId}`, {
            description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : '')
          });
        }
      }
    }
  }, [selectedChat, currentConversationId]);

  useEffect(() => {
    function onMessageHistory(chatMessages: Message[]) {
      if (Array.isArray(chatMessages)) {
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
      if (Array.isArray(data.messages)) {
        const messagesWithIds = data.messages.map(msg => ({
          ...msg,
          id: msg.id || nanoid()
        }));
        setMessages(messagesWithIds);
        scrollToBottom();
      } else {
        setMessages([]);
      }
    }

    function onNewMessage(message: Message) {
      const isForCurrentChat = selectedChat === message.userId ||
              (message.conversationId && message.conversationId === currentConversationId);

      if (isForCurrentChat) {
        setMessages(prevMessages => {
          // Check for duplicate messages
          const messageExists = prevMessages.some(
            msg => msg.id === message.id || 
            (msg.message === message.message && 
             msg.sender === message.sender && 
             Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 3000)
          );

          if (messageExists) {
            return prevMessages;
          }

          const newMessage = {
            ...message,
            id: message.id || nanoid()
          };

          showToastNotification(message);

          return [...prevMessages, newMessage];
        });
        
        scrollToBottom();
      } else {
        showToastNotification(message);
      }
    }

    // Register event listeners
    socket.on('messageHistory', onMessageHistory);
    socket.on('conversationMessages', onConversationMessages);
    socket.on('newMessage', onNewMessage);

    return () => {
      socket.off('messageHistory', onMessageHistory);
      socket.off('conversationMessages', onConversationMessages);
      socket.off('newMessage', onNewMessage);
    };
  }, [socket, selectedChat, currentConversationId, scrollToBottom, showToastNotification]);

  const sendMessage = useCallback((message: string) => {
    if (!selectedChat || !currentConversationId || !message.trim()) {
      return;
    }

    // Create temporary message for optimistic UI update
    const tempMessage: Message = {
      id: nanoid(),
      userId: selectedChat,
      message: message.trim(),
      sender: 'agent',
      agentId,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    };

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('message', {
      userId: selectedChat,
      message: message.trim(),
      agentId,
      conversationId: currentConversationId
    }, (response: { success: boolean; message?: string }) => {
      if (!response.success) {
        toast.error(`Error al enviar mensaje: ${response.message || 'Error desconocido'}`);
      }
    });

    scrollToBottom();
  }, [selectedChat, currentConversationId, agentId, scrollToBottom, socket]);

  return {
    messages,
    sendMessage,
    messagesEndRef,
    scrollToBottom
  };
} 