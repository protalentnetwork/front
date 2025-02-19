// components/Chat.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Minimize2 } from 'lucide-react';

interface ChatProps {
    chatId: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'agent';
    timestamp: string;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Cargar mensajes del chat específico
        const loadMessages = async () => {
            try {
                const response = await fetch(`/api/zendesk/chats/${chatId}/messages`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            setLoading(true);

            // Enviar mensaje a Zendesk
            const response = await fetch(`/api/zendesk/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: newMessage
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: newMessage,
                    sender: 'agent',
                    timestamp: new Date().toISOString()
                }]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                <h3 className="font-semibold">Chat #{chatId}</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-blue-600 p-1 rounded"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'agent'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            <p>{message.text}</p>
                            <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !newMessage.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;