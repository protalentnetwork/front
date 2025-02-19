import ZendeskChat from '@/components/zendesk';

export default function ChatPage() {
  return (
    <div>
      <h1>Chat con clientes</h1>
      <ZendeskChat
        zendeskKey="a7fd529e-74a6-49a9-9297-2b754c8c25f2"
        departmentId="123" // Opcional
        defaultMessage="¡Hola! ¿Cómo podemos ayudarte hoy?" // Opcional
      />
    </div>
  )
}