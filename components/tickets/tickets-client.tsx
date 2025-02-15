"use client"

import { useState, useEffect } from "react"
import { TicketsTable } from "./tickets-table"

interface TicketUser {
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
}

interface TicketsClientProps {
  initialTickets: Ticket[]
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {
  console.log('Initial tickets recibidos:', JSON.stringify(initialTickets, null, 2))
  
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    console.log('useEffect - initialTickets:', JSON.stringify(initialTickets, null, 2))
    if (Array.isArray(initialTickets)) {
      setTickets(initialTickets)
    }
  }, [initialTickets])

  console.log('Estado actual de tickets:', JSON.stringify(tickets, null, 2))

  return (
    <>
      <TicketsTable tickets={tickets} />
    </>
  )
} 