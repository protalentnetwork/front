import { TicketsClient } from "@/components/tickets/tickets-client"

const fetchTickets = async () => {
  const response = await fetch(`${process.env.BACKEND_URL}/zendesk/tickets/all`)
  const data = await response.json()
  console.log('Tickets data:', JSON.stringify(data, null, 2))
  // Si data es un array, lo usamos directamente, si no, buscamos en data.tickets
  const tickets = Array.isArray(data) ? data : data?.tickets || []
  console.log('Tickets procesados:', JSON.stringify(tickets, null, 2))
  return tickets
}

export default async function TicketsPage() {
  const tickets = await fetchTickets()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tickets</h1>
      </div>
      
      <TicketsClient initialTickets={tickets} />
    </div>
  )
}
