"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { TicketUser } from "./tickets-client"

interface CommentMetadata {
  system: {
    client: string
    ip_address: string
    location: string
    latitude: number
    longitude: number
  }
  custom: Record<string, unknown>
}

interface CommentVia {
  channel: string
  source: {
    from: Record<string, unknown>
    to: {
      name: string
      address: string
    }
    rel: string | null
  }
}

interface Comment {
  id: number
  type: string
  author_id: number
  body: string
  html_body: string
  plain_body: string
  public: boolean
  attachments: []
  audit_id: number
  via: CommentVia
  created_at: string
  metadata: CommentMetadata
}

interface CommentsResponse {
  comments: Comment[]
  next_page: string | null
  previous_page: string | null
  count: number
}

interface TicketChatModalProps {
  isOpen: boolean
  onClose: () => void
  user: TicketUser
  ticketId: number
}

export function TicketChatModal({ isOpen, onClose, user, ticketId }: TicketChatModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
        const endpoint = `/zendesk/tickets/${ticketId}/comments`
        const url = `${baseUrl}${endpoint}`
        
        console.log('Fetching comments from:', url)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          console.error('Error response:', response.status, response.statusText)
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data: CommentsResponse = await response.json()
        setComments(data.comments)
      } catch (error) {
        console.error('Error fetching comments:', error)
        setError('Error al cargar los mensajes. Por favor, intenta de nuevo.')
        setTimeout(() => {
          toast.error('Error al cargar los mensajes')
        }, 100)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && ticketId) {
      fetchComments()
    }
  }, [isOpen, ticketId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      setError(null)
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const response = await fetch(`${baseUrl}/zendesk/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: {
            body: newMessage,
            public: true
          }
        }),
      })

      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response body:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      // Actualizar la lista de comentarios
      const updatedResponse = await fetch(`${baseUrl}/zendesk/tickets/${ticketId}/comments`)
      if (!updatedResponse.ok) {
        throw new Error('Error al actualizar los mensajes')
      }
      
      const updatedData: CommentsResponse = await updatedResponse.json()
      setComments(updatedData.comments)
      setNewMessage("")
      
      // Usamos setTimeout para evitar problemas de actualización de estado
      setTimeout(() => {
        toast.success('Mensaje enviado correctamente')
      }, 100)
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error al enviar el mensaje. Por favor, contacta al soporte técnico.')
      
      // Usamos setTimeout para evitar problemas de actualización de estado
      setTimeout(() => {
        toast.error('Error al enviar el mensaje. Detalle en consola.')
      }, 100)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch (error) {
      return 'Fecha inválida ' + error
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">
            Chat con {user?.name || 'Usuario'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {user?.email || 'Sin email'} - Ticket #{ticketId}
          </DialogDescription>
        </DialogHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-muted-foreground">Cargando mensajes...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full text-destructive">
              <span>{error}</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-muted-foreground">No hay mensajes aún</span>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`flex ${
                  comment.via.channel === "web" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    comment.via.channel === "web"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{comment.plain_body}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="border-t pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={isLoading || isSending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || isSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 