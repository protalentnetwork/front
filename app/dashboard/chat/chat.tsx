'use client';

import React, { useEffect, useState } from 'react';

// Definimos interfaces específicas para las opciones del widget
interface ZendeskWebWidgetSettings {
    webWidget: {
        color?: {
            theme?: string;
        };
        launcher?: {
            chatLabel?: {
                [key: string]: string;
            };
        };
    };
}

// Definición del tipo para la función zE
type ZendeskFunction = (
    action: string,
    command: string,
    options?: string | ZendeskWebWidgetSettings | Record<string, string>
) => void;

// Extendemos el objeto window global
declare global {
    interface Window {
        zE?: ZendeskFunction;
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

                if (chatId) {
                    window.zE('messenger', 'open');
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
                    window.zE('webWidget', 'setLocale', 'es');

                    const widgetSettings: ZendeskWebWidgetSettings = {
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
                    };

                    window.zE('webWidget', 'updateSettings', widgetSettings);
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
    }, [chatId]);

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