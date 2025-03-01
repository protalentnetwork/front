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
  // Tracking recently sent messages to prevent duplicates
  const sentMessagesRef = useRef<Set<string>>(new Set());

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
      // Clear sent messages tracking when changing chats
      sentMessagesRef.current.clear();
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
          // Create a more robust message fingerprint
          const messageFingerprint = `${message.sender}-${message.message}-${message.userId}-${new Date(message.timestamp).getTime()}`;
          
          // Check if this message was recently sent by this client
          if (sentMessagesRef.current.has(messageFingerprint)) {
            // Message was sent by this client, don't add it again
            return prevMessages;
          }
          
          // Check for duplicate messages with more robust criteria
          const messageExists = prevMessages.some(msg => {
            // Check exact ID match
            if (msg.id === message.id && message.id) {
              return true;
            }
            
            // Check content + metadata similarity with larger time window
            if (msg.message === message.message && 
                msg.sender === message.sender && 
                msg.userId === message.userId &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(message.timestamp).getTime()) < 5000) {
              return true;
            }
            
            return false;
          });

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

    const trimmedMessage = message.trim();
    
    // Create temporary message for optimistic UI update
    const tempMessage: Message = {
      id: nanoid(),
      userId: selectedChat,
      message: trimmedMessage,
      sender: 'agent',
      agentId,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId
    };

    // Add message fingerprint to sent messages tracker
    const messageFingerprint = `agent-${trimmedMessage}-${selectedChat}-${new Date(tempMessage.timestamp).getTime()}`;
    sentMessagesRef.current.add(messageFingerprint);

    // Clean up old message fingerprints after 10 seconds to prevent memory leaks
    setTimeout(() => {
      sentMessagesRef.current.delete(messageFingerprint);
    }, 10000);

    setMessages(prev => [...prev, tempMessage]);

    socket.emit('message', {
      userId: selectedChat,
      message: trimmedMessage,
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