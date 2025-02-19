// components/ZendeskChat.tsx
import { useEffect } from 'react';

declare global {
  interface Window {
    zESettings: any;
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
          defaultMessage: defaultMessage || 'Hola, ¿en qué puedo ayudarte?'
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