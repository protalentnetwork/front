import { UsersClient } from "@/components/users/users-client"

const fetchUsers = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
  const data = await response.json()
  return data
}

export default async function UsersPage() {
  const users = await fetchUsers()

  return (
    <div className="p-6">
      <UsersClient initialUsers={users} />
    </div>
  )
}