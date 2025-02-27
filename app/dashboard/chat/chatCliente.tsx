'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

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

interface ChatProps {
    chatId: string; // El userId del cliente
}

const ChatCliente: React.FC<ChatProps> = ({ chatId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Para auto-scroll

    // Auto-scroll al final de los mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Cliente conectado al servidor WebSocket');
            setIsConnected(true);
            socket.emit('joinChat', { userId: chatId });
            console.log(`Cliente ${chatId} se unió al chat`);
        });

        socket.on('connect_error', (err) => {
            console.error('Error de conexión WebSocket en cliente:', err.message);
            setIsConnected(false);
        });

        socket.on('messageHistory', (history: Message[]) => {
            console.log('Historial de mensajes recibido:', history);
            setMessages(Array.isArray(history) ? history : []);
            scrollToBottom();
        });

        socket.on('message', (message: Message) => {
            console.log('Mensaje recibido del agente:', message);
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('messageHistory');
            socket.off('message');
        };
    }, [chatId]);

    const sendMessage = () => {
        if (input.trim()) {
            console.log(`Enviando mensaje desde ${chatId}: ${input}`);
            const messageData = {
                userId: chatId,
                message: input,
            };
            socket.emit('clientMessage', messageData);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(), // ID temporal
                    userId: chatId,
                    message: input,
                    sender: 'client',
                    agentId: null,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setInput('');
            scrollToBottom();
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            {/* Encabezado */}
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                <h3 className="text-lg font-semibold">Chat con Soporte</h3>
                <span
                    className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                        }`}
                    title={isConnected ? 'Conectado' : 'Desconectado'}
                />
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {isConnected ? (
                    messages.length > 0 ? (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'
                                    } mb-4`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg shadow ${msg.sender === 'client'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p>{msg.message}</p>
                                    <span className="text-xs opacity-75 block mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No hay mensajes aún</p>
                    )
                ) : (
                    <p className="text-gray-500 text-center">Conectando al chat...</p>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input y Botón */}
            <div className="p-4 bg-gray-100 border-t flex items-center space-x-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe un mensaje..."
                    disabled={!isConnected}
                />
                <button
                    onClick={sendMessage}
                    className={`p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${!isConnected || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={!isConnected || !input.trim()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatCliente;