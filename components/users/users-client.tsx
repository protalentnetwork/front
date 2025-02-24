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
  const [users, setUsers] = useState(initialUsers) // Estado para la lista completa

  // Función para refrescar la lista desde el backend
  const refreshUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data) // Actualizamos la lista completa
        setFilteredUsers(data) // Actualizamos la lista filtrada
      } else {
        console.error("Error fetching users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    let filtered = [...users] // Usamos la lista completa como base

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