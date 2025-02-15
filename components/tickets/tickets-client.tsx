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
 
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (Array.isArray(initialTickets)) {
      setTickets(initialTickets)
    }
  }, [initialTickets])


  return (
    <>
      <TicketsTable tickets={tickets} />
    </>
  )
} 