// app/dashboard/chat/ZendeskWidget.tsx
'use client';

import { useEffect } from 'react';

const ZendeskWidget = () => {
    useEffect(() => {
        // Configuración inicial del widget
        const loadWidget = () => {
            const script = document.createElement('script');
            script.id = 'ze-snippet';
            script.src = 'https://static.zdassets.com/ekr/snippet.js?key=a7fd529e-74a6-49a9-9297-2b754c8c25f2';
            script.async = true;

            script.onload = () => {
                if (window.zE) {
                    window.zE('webWidget', 'setLocale', 'es');
                }
            };

            document.head.appendChild(script);
        };

        // Solo cargar si no existe
        if (!document.getElementById('ze-snippet')) {
            loadWidget();
        }

        return () => {
            const zendeskScript = document.getElementById('ze-snippet');
            if (zendeskScript) {
                document.head.removeChild(zendeskScript);
            }
        };
    }, []);

    return null;
};

export default ZendeskWidget;