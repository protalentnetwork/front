import { TicketsClient } from "@/components/tickets/tickets-client"

const fetchTickets = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const response = await fetch(`${baseUrl}/zendesk/tickets/all`, {
    cache: 'no-store'
  })
  const data = await response.json()
  const tickets = Array.isArray(data) ? data : data?.tickets || []
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
