'use client';

import React, { useState } from 'react';

interface ChatInputProps {
    chatId: string | null;
    agentId: string;
    socket: any;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatId, agentId, socket }) => {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || !chatId || isSending) return;

        try {
            setIsSending(true);

            socket.emit('message', {
                userId: chatId,
                agentId: agentId,
                message: input.trim()
            });

            try {
                await fetch('https://backoffice-casino-back-production.up.railway.app/chat/send-agent-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: chatId,
                        agentId: agentId,
                        message: input.trim()
                    }),
                });
            } catch (error) {
                console.error('Error al enviar mensaje por HTTP:', error);
            }

            setInput('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="border-t bg-white p-4">
            <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Escribe un mensaje..."
                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 pr-12 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[52px] max-h-32"
                        rows={1}
                        style={{
                            height: 'auto',
                            minHeight: '52px',
                            maxHeight: '128px'
                        }}
                        disabled={isSending}
                    />
                    <button
                        className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Adjuntar archivo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isSending}
                    className={`flex items-center justify-center rounded-lg p-3 transition-colors ${input.trim() && !isSending
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isSending ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ChatInput;