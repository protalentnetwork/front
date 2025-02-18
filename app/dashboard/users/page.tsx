import { UsersClient } from "@/components/users/users-client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const fetchUsers = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
  const data = await response.json()
  return data
}

export default async function UsersPage() {
  const users = await fetchUsers()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>


        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Crear Usuario
        </Button>

      </div>

      <UsersClient initialUsers={users} />
    </div>
  )
}