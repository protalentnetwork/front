"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMemo } from "react"
import { User } from "@/types/user"

interface UsersFiltersProps {
  onFilterChange: (field: string, value: string) => void
  users: User[]
}

export function UsersFilters({ onFilterChange, users }: UsersFiltersProps) {
  // Get unique normalized values for each filter
  const filterOptions = useMemo(() => {
    const getUniqueValues = (field: keyof User) => {
      let values = new Set<string>()
      if(users.length === 0){
        values = new Set(users.map(user => user[field].toString().toLowerCase()))
      }
      return Array.from(values).sort()
    }

    return {
      roles: getUniqueValues('role'),
      offices: getUniqueValues('office'),
      statuses: getUniqueValues('status')
    }
  }, [users])

  // Helper to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input
        placeholder="Buscar por usuario..."
        className="max-w-xs"
        onChange={(e) => onFilterChange('name', e.target.value)}
      />
      <Select onValueChange={(value) => onFilterChange('role', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los roles</SelectItem>
          {filterOptions.roles.map(role => (
            <SelectItem key={role} value={role}>
              {capitalize(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {filterOptions.statuses.map(status => (
            <SelectItem key={status} value={status}>
              {capitalize(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange('office', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por oficina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las oficinas</SelectItem>
          {filterOptions.offices.map(office => (
            <SelectItem key={office} value={office}>
              {capitalize(office)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 