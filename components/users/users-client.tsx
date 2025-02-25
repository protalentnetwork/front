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
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [users, setUsers] = useState(initialUsers)

  const refreshUsers = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
      } else {
        console.error("Client error fetching users:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Client error fetching users:", error)
    }
  }

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        // Update the local state with the updated user
        setUsers(prevUsers => 
          prevUsers.map(user => user.id === userId ? { ...user, ...updatedUser } : user)
        )
        setFilteredUsers(prevFiltered => 
          prevFiltered.map(user => user.id === userId ? { ...user, ...updatedUser } : user)
        )
        return updatedUser
      } else {
        console.error("Error updating user:", response.status, response.statusText)
        throw new Error(`Error updating user: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
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
      <UsersTable 
        users={filteredUsers} 
        onUpdateUser={updateUser} 
        onRefreshUsers={refreshUsers}
      />
    </>
  )
}