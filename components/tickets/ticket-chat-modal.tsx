"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  // Campo para manejar comentarios locales que aún no han sido sincronizados
  isLocalMessage?: boolean
}

interface CommentsResponse {
  comments: Comment[]
  next_page: string | null
  previous_page: string | null
  count: number
}

// Definir una interfaz para la información del ticket
interface TicketInfo {
  id: number;
  subject: string;
  description: string;
  status: string;
  requester_id: number;
  assignee_id?: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    name: string;
    email: string;
  };
  group_id?: number;
}

interface TicketChatModalProps {
  isOpen: boolean
  onClose: () => void
  user: TicketUser
  ticketId: number
  agentId: string;
}

export function TicketChatModal({ isOpen, onClose, user, ticketId, agentId }: TicketChatModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Función para obtener info del ticket (incluyendo requester_id)
  const fetchTicketInfo = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const response = await fetch(`${baseUrl}/zendesk/tickets/${ticketId}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Ticket info:", data)
      setTicketInfo(data)
      return data
    } catch (error) {
      console.error('Error fetching ticket info:', error)
      return null
    }
  }, [ticketId]);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      const response = await fetch(`${baseUrl}/zendesk/tickets/${ticketId}/comments`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: CommentsResponse = await response.json()

      console.log("Comentarios recibidos:", data.comments)

      // Obtener el ticket para conocer el requester_id
      const ticketData = await fetchTicketInfo()
      const requesterId = ticketData?.requester_id

      // Log detallado de cada comentario
      if (data.comments && data.comments.length > 0) {
        data.comments.forEach((comment, i) => {
          console.log(`Comentario ${i}:`, {
            id: comment.id,
            author_id: comment.author_id,
            via_channel: comment.via?.channel,
            is_requester: requesterId && comment.author_id === requesterId,
            is_agent: comment.author_id === parseInt(agentId),
            public: comment.public,
            type: comment.type,
            isFirstComment: i === 0
          });
        });
      }

      // Filtrar mensajes locales temporales para evitar duplicados
      const serverComments = data.comments.map(comment => ({
        ...comment,
        isLocalMessage: false
      }))

      // Mantener solo comentarios locales que no coincidan con los del servidor
      const localComments = comments.filter(comment =>
        comment.isLocalMessage &&
        !serverComments.some(serverComment =>
          serverComment.plain_body === comment.plain_body &&
          new Date(serverComment.created_at).getTime() > Date.now() - 60000
        )
      )

      setComments([...serverComments, ...localComments])
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('Error al cargar los mensajes. Por favor, intenta de nuevo.')
      setTimeout(() => {
        toast.error('Error al cargar los mensajes')
      }, 100)
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }, [ticketId, agentId, comments, fetchTicketInfo]);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchComments()

      // Polling para actualizar comentarios cada 10 segundos
      const intervalId = setInterval(fetchComments, 10000)

      return () => clearInterval(intervalId)
    }
  }, [isOpen, ticketId, fetchComments])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      setError(null)
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL

      // Añadir mensaje temporal a la interfaz inmediatamente
      const tempId = Date.now()
      const tempMessage: Comment = {
        id: tempId,
        type: "Comment",
        author_id: parseInt(agentId),
        body: newMessage,
        html_body: newMessage,
        plain_body: newMessage,
        public: true,
        attachments: [],
        audit_id: tempId,
        via: { channel: "api", source: { from: {}, to: { name: "API", address: "" }, rel: null } },
        created_at: new Date().toISOString(),
        metadata: { system: { client: "", ip_address: "", location: "", latitude: 0, longitude: 0 }, custom: {} },
        isLocalMessage: true // Marca el mensaje como local/temporal
      }

      console.log("Enviando mensaje como agente con ID:", agentId)
      console.log("Mensaje temporal:", tempMessage)

      // Actualizar UI inmediatamente con mensaje temporal
      setComments(prevComments => [...prevComments, tempMessage])
      setNewMessage("")
      scrollToBottom()

      // Enviar a la API
      const response = await fetch(`${baseUrl}/zendesk/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: newMessage,
          authorId: agentId,
        }),
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log('Respuesta del servidor tras enviar mensaje:', responseData)

      // Actualizar los comentarios después de un breve retraso
      setTimeout(() => {
        fetchComments()
      }, 1000)

      toast.success('Mensaje enviado correctamente como agente')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error al enviar el mensaje. Por favor, intenta de nuevo.')
      toast.error('Error al enviar el mensaje como agente')

      // Eliminar el mensaje temporal en caso de error
      setComments(prevComments =>
        prevComments.filter(comment => !comment.isLocalMessage)
      )
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
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

  // Determinar si un comentario fue escrito por el cliente (requester)
  const isClientComment = (comment: Comment) => {
    // Si tenemos la información del ticket, podemos comparar con el requester_id
    if (ticketInfo?.requester_id) {
      return comment.author_id === ticketInfo.requester_id
    }

    // Si es un mensaje local/temporal que creamos como agente
    if (comment.isLocalMessage) {
      return false
    }

    // Si coincide con el ID del agente actual, definitivamente NO es del cliente
    if (comment.author_id === parseInt(agentId)) {
      return false
    }

    // El primer comentario generalmente es la descripción del ticket (del cliente)
    if (comments.indexOf(comment) === 0) {
      return true
    }

    // Si viene del canal web, probablemente es del cliente
    if (comment.via?.channel === "web") {
      return true
    }

    // En caso de duda, asumimos que es del cliente si no podemos confirmar que es del agente
    return true
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
          {isLoading && comments.length === 0 ? (
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
            <>
              {comments.map((comment) => {
                const isFromClient = isClientComment(comment)

                return (
                  <div
                    key={comment.id}
                    className={`flex ${isFromClient ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${isFromClient
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground ml-auto"
                        } ${comment.isLocalMessage ? "opacity-80" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold">
                          {isFromClient ? user.name : "Agente"}
                        </span>
                        {comment.isLocalMessage && (
                          <span className="text-xs ml-2 opacity-70">
                            enviando...
                          </span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.plain_body}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {comment.isLocalMessage ? "Ahora" : formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
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
              disabled={isLoading || isSending || !newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}