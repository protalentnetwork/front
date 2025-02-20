'use client';

import { useEffect } from 'react';

// Extender la interfaz Window para TypeScript
declare global {
    interface Window {
        zESettings?: {
            webWidget: {
                chat: {
                    departments: {
                        select?: string;
                    };
                    defaultMessage?: string;
                };
                offset: {
                    horizontal: string;
                    vertical: string;
                };
                position: {
                    horizontal: string;
                    vertical: string;
                };
            };
        };
        zE?: (action: string, command: string, options?: Record<string, string>) => void; // Cambiado any por Record<string, string>
    }
}

interface ZendeskChatProps {
    zendeskKey: string;
    departmentId?: string;
    defaultMessage?: string;
}

const ZendeskChat: React.FC<ZendeskChatProps> = ({
    zendeskKey,
    departmentId,
    defaultMessage
}) => {
    useEffect(() => {
        // Crear el script de Zendesk
        const script = document.createElement('script');
        script.id = 'ze-snippet';
        script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
        script.async = true;

        // Configurar el widget
        window.zESettings = {
            webWidget: {
                chat: {
                    departments: {
                        select: departmentId
                    },
                    defaultMessage: defaultMessage || '¿En qué puedo ayudarte?'
                },
                offset: {
                    horizontal: '20px',
                    vertical: '20px'
                },
                position: { horizontal: 'right', vertical: 'bottom' }
            }
        };

        // Agregar el script al documento
        document.head.appendChild(script);

        return () => {
            // Limpiar el script cuando el componente se desmonte
            const zendeskScript = document.getElementById('ze-snippet');
            if (zendeskScript) {
                document.head.removeChild(zendeskScript);
            }
        };
    }, [zendeskKey, departmentId, defaultMessage]);

    return null;
};

export default ZendeskChat;