"use client"

import { useState } from "react"
import { UsersTable } from "./users-table"
import { UsersFilters } from "./users-filters"
import { User } from "@/types/user"
import { CreateUserModal } from "@/app/dashboard/users/create-user-modal"

interface UsersClientProps {
  initialUsers: User[]
  userType: 'internal' | 'external'
}

export function UsersClient({ initialUsers, userType }: UsersClientProps) {
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [users, setUsers] = useState(initialUsers)

  const refreshUsers = async () => {
    try {
      // Usamos un endpoint diferente según el tipo de usuario
      const endpoint = userType === 'internal' ? 'users' : 'external-users'
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${endpoint}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        setFilteredUsers(data)
      } else {
        console.error(`Client error fetching ${userType} users:`, response.status, response.statusText)
      }
    } catch (error) {
      console.error(`Client error fetching ${userType} users:`, error)
    }
  }

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      // Usamos un endpoint diferente según el tipo de usuario
      const endpoint = userType === 'internal' ? 'users' : 'external-users'
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${endpoint}/${userId}`

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
        console.error(`Error updating ${userType} user:`, response.status, response.statusText)
        throw new Error(`Error updating user: ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error updating ${userType} user:`, error)
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
        <h2 className="text-xl font-semibold">
          {userType === 'internal' ? 'Usuarios Internos' : 'Usuarios Externos'}
        </h2>
        <CreateUserModal
          onUserCreated={refreshUsers}
          userType={userType}
        />
      </div>
      <UsersFilters onFilterChange={handleFilterChange} users={users} />
      <UsersTable
        users={filteredUsers}
        onUpdateUser={updateUser}
        onRefreshUsers={refreshUsers}
        userType={userType}
      />
    </>
  )
}