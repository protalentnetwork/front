'use client';

import ChatDashboard from "./ChatDashboard";
import ZendeskWidget from "./ZendeskWidget";


export default function ChatPage() {
  return (
    <div className="p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Chats en Vivo</h1>
      <ChatDashboard />
      <ZendeskWidget />
    </div>
  )
}