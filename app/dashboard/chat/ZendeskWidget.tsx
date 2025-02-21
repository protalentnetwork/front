'use client';

import { useEffect } from 'react';

// Definimos tipos para las opciones de zE
type ZendeskOptions = string | Record<string, string | number | boolean>;

// Definimos la estructura del widget
interface ZendeskChatConfig {
    departments?: {
        select?: string;
        enabled?: string[];
    };
    // No usamos 'title' aquí; se mueve a nivel superior si es necesario
    defaultMessage?: string;
    // Agregamos propiedades válidas del Web Widget
    suppress?: boolean;
}

interface ZendeskWebWidgetSettings {
    webWidget: {
        chat?: ZendeskChatConfig;
        color?: {
            theme?: string;
        };
        launcher?: {
            chatLabel?: {
                [key: string]: string;
            };
        };
        offset?: {
            horizontal: string;
            vertical: string;
        };
        position?: {
            horizontal: 'left' | 'right';
            vertical: 'top' | 'bottom';
        };
        // Título del widget (si es lo que querías con 'title')
        title?: {
            '*': string; // Idiomas soportados con '*'' para todos
        };
        // Concierge settings
        concierge?: {
            name?: string;
            title?: {
                '*': string;
            };
            avatarPath?: string;
        };
    };
}

// Tipado global unificado (esto debería ir en un archivo .d.ts, pero lo dejo aquí por ahora)
declare global {
    interface Window {
        zE?: (action: string, command: string, options?: ZendeskOptions) => void;
        zESettings?: ZendeskWebWidgetSettings;
        $zopim?: unknown; // $zopim es legacy, lo tipamos como unknown por ahora
    }
}

const ZendeskWidget = () => {
    useEffect(() => {
        // Configuración del widget
        window.zESettings = {
            webWidget: {
                // Título del widget (en lugar de chat.title)
                title: {
                    '*': 'Chat con nosotros'
                },
                chat: {
                    // Configuraciones válidas para chat
                    defaultMessage: '¿En qué podemos ayudarte?',
                    suppress: false // Por ejemplo, para no suprimir el chat
                },
                concierge: {
                    name: 'Soporte Casino',
                    title: {
                        '*': 'Soporte en línea'
                    }
                },
                position: {
                    horizontal: 'right',
                    vertical: 'bottom'
                }
            }
        };

        // Cargamos el script
        const script = document.createElement('script');
        script.id = 'ze-snippet';
        script.src = 'https://static.zdassets.com/ekr/snippet.js?key=a7fd529e-74a6-49a9-9297-2b754c8c25f2';
        script.async = true;

        script.onload = () => {
            if (window.zE) {
                window.zE('webWidget', 'setLocale', 'es');
                window.zE('webWidget', 'show');

                // Configuraciones adicionales como callbacks
                window.zE('webWidget:on', 'chat:connected', () => {
                    console.log('Chat conectado');
                });

                window.zE('webWidget:on', 'chat:start', () => {
                    console.log('Chat iniciado');
                });
            } else {
                console.error('Zendesk zE no disponible después de cargar el script');
            }
        };

        script.onerror = () => {
            console.error('Error al cargar el script de Zendesk');
        };

        document.head.appendChild(script);

        return () => {
            if (window.zE) {
                window.zE('webWidget', 'hide');
            }
            const existingScript = document.getElementById('ze-snippet');
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, []); // Sin dependencias, ya que solo se carga una vez

    return null;
};

export default ZendeskWidget;