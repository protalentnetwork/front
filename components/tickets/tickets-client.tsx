"use client"

import { useState, useEffect } from "react"
import { TicketsTable } from "./tickets-table"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Sharing the same type definition between components
export interface TicketUser {
  name: string
  email: string
}

export interface Ticket {
  id: number
  subject: string
  description: string
  status: string
  requester_id: number
  assignee_id: number
  user: TicketUser
  group_id: number
  created_at: string
  updated_at: string
  custom_fields: Array<{
    id: number
    value: string | null
  }>
}

interface TicketsClientProps {
  initialTickets: Ticket[]
}

export function TicketsClient({ initialTickets }: TicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [filters, setFilters] = useState({
    subject: "",
    status: "all",
    user: "",
    dateRange: "all"
  })

  useEffect(() => {
    if (Array.isArray(initialTickets)) {
      setTickets(initialTickets)
      setFilteredTickets(initialTickets)
    }
  }, [initialTickets])

  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      // Safely handle potentially null values
      const ticketSubject = ticket.subject || ""
      const ticketStatus = ticket.status || ""
      const userName = ticket.user?.name || ""
      const userEmail = ticket.user?.email || ""
      
      const subjectMatch = ticketSubject.toLowerCase().includes(filters.subject.toLowerCase())
      const statusMatch = filters.status === "all" || ticketStatus.toLowerCase() === filters.status.toLowerCase()
      const userMatch = !filters.user || 
        userName.toLowerCase().includes(filters.user.toLowerCase()) ||
        userEmail.toLowerCase().includes(filters.user.toLowerCase())
      
      // Date filtering logic
      let dateMatch = true
      if (filters.dateRange !== "all" && ticket.created_at) {
        const ticketDate = new Date(ticket.created_at)
        const now = new Date()
        
        switch (filters.dateRange) {
          case "today":
            dateMatch = ticketDate.toDateString() === now.toDateString()
            break
          case "yesterday":
            const yesterday = new Date(now)
            yesterday.setDate(now.getDate() - 1)
            dateMatch = ticketDate.toDateString() === yesterday.toDateString()
            break
          case "thisWeek":
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            dateMatch = ticketDate >= weekStart
            break
          case "thisMonth":
            dateMatch = 
              ticketDate.getMonth() === now.getMonth() && 
              ticketDate.getFullYear() === now.getFullYear()
            break
          default:
            dateMatch = true
        }
      }
      
      return subjectMatch && statusMatch && userMatch && dateMatch
    })
    
    setFilteredTickets(filtered)
  }, [tickets, filters])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      subject: "",
      status: "all",
      user: "",
      dateRange: "all"
    })
  }

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "open", label: "Abierto" },
    { value: "pending", label: "Pendiente" },
    { value: "solved", label: "Resuelto" },
    { value: "closed", label: "Cerrado" }
  ]

  const dateRangeOptions = [
    { value: "all", label: "Cualquier fecha" },
    { value: "today", label: "Hoy" },
    { value: "yesterday", label: "Ayer" },
    { value: "thisWeek", label: "Esta semana" },
    { value: "thisMonth", label: "Este mes" }
  ]

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asunto</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por asunto..."
                  className="pl-8"
                  value={filters.subject}
                  onChange={(e) => handleFilterChange("subject", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <Input
                placeholder="Buscar por nombre o email..."
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de creación</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => handleFilterChange("dateRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rango" />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              disabled={!filters.subject && filters.status === "all" && !filters.user && filters.dateRange === "all"}
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <TicketsTable tickets={filteredTickets} />
    </>
  )
} 