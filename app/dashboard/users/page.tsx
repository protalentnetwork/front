import { UsersClient } from "@/components/users/users-client"

const fetchUsers = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
  console.log('Server fetching users from URL:', url, 'Time:', new Date().toISOString())
  const response = await fetch(url, {
    cache: 'no-store', // Evitar caché
  })
  if (!response.ok) {
    console.error('Server error fetching users:', response.status, response.statusText)
    return []
  }
  const data = await response.json()
  console.log('Server fetched users:', data)
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