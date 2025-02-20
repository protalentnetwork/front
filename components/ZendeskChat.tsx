// components/ZendeskChat.tsx
'use client';

import { useEffect } from 'react';
import type { ZendeskWebWidgetSettings } from '../types/zendesk';

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
        const script = document.createElement('script');
        script.id = 'ze-snippet';
        script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zendeskKey}`;
        script.async = true;

        const settings: ZendeskWebWidgetSettings = {
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

        window.zESettings = settings;

        document.head.appendChild(script);

        script.onload = () => {
            if (window.zE) {
                window.zE('webWidget', 'setLocale', 'es');
                window.zE('webWidget:on', 'open', 'function() { console.log("Widget abierto"); }');
            }
        };

        return () => {
            const zendeskScript = document.getElementById('ze-snippet');
            if (zendeskScript) {
                document.head.removeChild(zendeskScript);
            }
            if (window.zE) {
                window.zE('webWidget', 'hide');
            }
        };
    }, [zendeskKey, departmentId, defaultMessage]);

    return null;
};

export default ZendeskChat;