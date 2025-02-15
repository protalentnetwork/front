"use client"

import { useState } from "react"
import { UsersTable } from "./users-table"
import { UsersFilters } from "./users-filters"
import { User } from "@/types/user"

interface UsersClientProps {
  initialUsers: User[]
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)

  const handleFilterChange = (field: string, value: string) => {
    let filtered = [...initialUsers]

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
      <UsersFilters onFilterChange={handleFilterChange} users={initialUsers} />
      <UsersTable users={filteredUsers} />
    </>
  )
} 