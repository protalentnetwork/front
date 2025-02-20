'use client';

import React, { useEffect, useState } from 'react';

// Declaración de tipos para window.zE
declare global {
    interface Window {
        zE?: (action: string, command: string, options?: Record<string, string>) => void;
    }
}

interface ChatProps {
    chatId: string;
}

const Chat = ({ chatId }: ChatProps) => {
    const [widgetLoaded, setWidgetLoaded] = useState(false);

    useEffect(() => {
        const loadZendeskWidget = () => {
            if (window.zE) {
                window.zE('messenger', 'show');
                setWidgetLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'ze-snippet';
            script.src = 'https://static.zdassets.com/ekr/snippet.js?key=a7fd529e-74a6-49a9-9297-2b754c8c25f2';
            script.async = true;

            script.onload = () => {
                if (window.zE) {
                    window.zE('messenger', 'show');
                    setWidgetLoaded(true);
                } else {
                    console.error('Zendesk zE function no está disponible después de cargar el script.');
                }
            };

            script.onerror = () => {
                console.error('Error al cargar el Widget de Zendesk');
            };

            document.body.appendChild(script);

            return () => {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
                if (window.zE) {
                    window.zE('messenger', 'hide');
                }
            };
        };

        loadZendeskWidget();
    }, []);

    return (
        <div className="h-full">
            {widgetLoaded ? (
                <div id="zendesk-chat-container" className="h-full" />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    Cargando Zendesk Chat...
                </div>
            )}
        </div>
    );
};

export default Chat;