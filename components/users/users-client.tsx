"use client"

import { useState } from "react"
import { UsersTable } from "./users-table"
import { UsersFilters } from "./users-filters"
import { User } from "@/types/user"
import { CreateUserModal } from "@/app/dashboard/users/create-user-modal"

interface UsersClientProps {
  initialUsers: User[]
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  console.log('Client initial users:', initialUsers, 'Time:', new Date().toISOString())
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [users, setUsers] = useState(initialUsers)

  const refreshUsers = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
      console.log('Client refreshing users from URL:', url, 'Time:', new Date().toISOString())
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('Client refreshed users:', data)
        setUsers(data)
        setFilteredUsers(data)
      } else {
        console.error("Client error fetching users:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Client error fetching users:", error)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    let filtered = [...users]

    if (value && value !== 'all') {
      filtered = filtered.filter(user => {
        switch (field) {
          case 'name':
            return user.username.toLowerCase().includes(value.toLowerCase())
          case 'role':
            return user.role.toLowerCase() === value.toLowerCase()
          case 'office':
            return user.office.toLowerCase() === value.toLowerCase()
          case 'status':
            return user.status.toLowerCase() === value.toLowerCase()
          default:
            return true
        }
      })
    }

    setFilteredUsers(filtered)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <CreateUserModal onUserCreated={refreshUsers} />
      </div>
      <UsersFilters onFilterChange={handleFilterChange} users={users} />
      <UsersTable users={filteredUsers} />
    </>
  )
}