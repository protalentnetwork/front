'use client';

import React, { useEffect, useState } from 'react';

// Declaración de tipos para window.zE
declare global {
    interface Window {
        zE?: (action: string, command: string, options?: Record<string, string>) => void;
    }
}



const Chat = () => {
    const [widgetLoaded, setWidgetLoaded] = useState(false);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_ZENDESK_KEY) {
            console.error('Zendesk key is missing. Please set NEXT_PUBLIC_ZENDESK_KEY in your environment.');
            return;
        }

        const loadZendeskWidget = () => {
            if (window.zE) {
                window.zE('messenger', 'show');
                setWidgetLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.id = 'ze-snippet';
            script.src = `https://static.zdassets.com/ekr/snippet.js?key=${process.env.NEXT_PUBLIC_ZENDESK_KEY}`;
            script.async = true;

            script.onload = () => {
                if (window.zE) {
                    window.zE('messenger', 'show');
                    setWidgetLoaded(true);
                } else {
                    console.error('Zendesk zE function is not available after script load.');
                }
            };

            script.onerror = () => {
                console.error('Failed to load Zendesk Widget');
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
    }, []); // Sin dependencia de chatId, ya que el widget no lo usa

    return (
        <div className="h-full">
            {widgetLoaded ? (
                <div id="zendesk-chat-container" className="h-full" />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    Loading Zendesk Chat...
                </div>
            )}
        </div>
    );
};

export default Chat;