'use client';

import React, { useEffect, useState } from 'react';

declare global {
    interface Window {
        zE?: (action: string, command: string, options?: Record<string, any>) => void;
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
                // Configurar y mostrar el widget
                window.zE('messenger', 'show');

                // Si tenemos un chatId, podemos usarlo para cargar la conversación específica
                if (chatId) {
                    window.zE('messenger', 'open');
                    // Aquí podrías agregar lógica adicional para cargar el chat específico
                    console.log('Cargando chat específico:', chatId);
                }

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

                    // Configuración adicional del widget
                    window.zE('webWidget', 'setLocale');
                    window.zE('webWidget', 'updateSettings', {
                        webWidget: {
                            color: {
                                theme: '#000000'
                            },
                            launcher: {
                                chatLabel: {
                                    'es-ES': 'Chat con nosotros'
                                }
                            }
                        }
                    });
                }
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
    }, [chatId]); // Agregamos chatId como dependencia

    return (
        <div className="h-full relative">
            {widgetLoaded ? (
                <div id="zendesk-chat-container" className="h-full">
                    {chatId && (
                        <div className="absolute top-0 left-0 p-4 bg-blue-100 rounded-md">
                            Chat ID: {chatId}
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    Cargando Zendesk Chat...
                </div>
            )}
        </div>
    );
};

export default Chat;