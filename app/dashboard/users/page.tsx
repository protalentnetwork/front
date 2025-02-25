import { UsersClient } from "@/components/users/users-client"

const fetchUsers = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
  const response = await fetch(url, {
    cache: 'no-store', // Evitar caché
  })
  if (!response.ok) {
    console.error('Server error fetching users:', response.status, response.statusText)
    return []
  }
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