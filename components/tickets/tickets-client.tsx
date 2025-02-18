"use client"

import { useState, useEffect } from "react"
import { TicketsTable } from "./tickets-table"

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

interface TicketsClientProps {
  initialTickets: Ticket[]
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {

  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    console.log('initialTickets:', initialTickets)
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