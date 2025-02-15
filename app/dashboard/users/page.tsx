import { UsersClient } from "@/components/users/users-client"

const fetchUsers = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/users`, {
    cache: 'no-store'
  })
  const data = await response.json()
  return data
}

export default async function UsersPage() {
  const users = await fetchUsers()
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
      </div>
      
      <UsersClient initialUsers={users} />
    </div>
  )
}
