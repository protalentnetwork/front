"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { TicketChatModal } from "./ticket-chat-modal"

interface TicketUser {
  name: string
  email: string
}

interface AssignedUser {
  name: string
  email: string
}

interface Ticket {
  id: number
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  description: string
  user: TicketUser
  assigned_to: AssignedUser | null
}

interface TicketsTableProps {
  tickets: Ticket[]
}

export function TicketsTable({ tickets = [] }: TicketsTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch (error) {
      return 'Fecha inválida ' + error
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'solved':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No hay tickets disponibles</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N°</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket, index) => (
              <TableRow 
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTicket(ticket)}
              >
                <TableCell className="font-medium">#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.user?.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {ticket.user?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{ticket.subject}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.assigned_to ? (
                    <div className="flex flex-col">
                      <span className="font-medium">{ticket.assigned_to.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {ticket.assigned_to.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sin asignar
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(ticket.created_at)}
                </TableCell>
                <TableCell>
                  {formatDate(ticket.updated_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedTicket && (
        <TicketChatModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          user={selectedTicket.user}
          ticketId={selectedTicket.id}
        />
      )}
    </>
  )
}