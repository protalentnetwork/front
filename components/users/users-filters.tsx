"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UsersFiltersProps {
  onFilterChange: (field: string, value: string) => void
}

export function UsersFilters({ onFilterChange }: UsersFiltersProps) {
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
          <SelectItem value="administrador">Administrador</SelectItem>
          <SelectItem value="usuario">Usuario</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange('status', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activo</SelectItem>
          <SelectItem value="inactive">Inactivo</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => onFilterChange('office', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por oficina" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las oficinas</SelectItem>
          <SelectItem value="central">Central</SelectItem>
          <SelectItem value="sucursal a">Sucursal A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 