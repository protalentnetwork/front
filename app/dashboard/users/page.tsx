import { UsersClient } from "@/components/users/users-client"

const fetchUsers = async () => {
  const response = await fetch(`${process.env.BACKEND_URL}/users`)
  const data = await response.json()
  console.log(data)
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
