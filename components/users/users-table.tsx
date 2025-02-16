"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PencilIcon, History, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/types/user"
import { useState } from "react"
import { EditUserModal } from "./edit-user-modal"
import { SessionsModal } from "./sessions-modal"

interface UsersTableProps {
  users: User[]
}

function getStatusDisplay(status: string) {
  const normalizedStatus = status.toLowerCase()
  if (['active', 'activo'].includes(normalizedStatus)) {
    return {
      label: 'Activo',
      className: 'bg-green-100 text-green-800'
    }
  }
  if (['inactive', 'inactivo'].includes(normalizedStatus)) {
    return {
      label: 'Inactivo',
      className: 'bg-red-100 text-red-800'
    }
  }
  return {
    label: status,
    className: 'bg-gray-100 text-gray-800'
  }
}

export function UsersTable({ users }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleViewSessions = (user: User) => {
    setSelectedUser(user)
    setIsSessionsModalOpen(true)
    setOpenDropdownId(null)
  }

  const handleSaveUser = (updatedUser: Partial<User>) => {
    // Aquí implementarías la lógica para guardar los cambios
    console.log('Guardando cambios:', updatedUser)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Retiros</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Creado: {new Intl.DateTimeFormat(undefined, {
                        dateStyle: 'medium',
                        timeZone: 'UTC'
                      }).format(new Date(user.createdAt))}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.office}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    getStatusDisplay(user.status).className
                  }`}>
                    {getStatusDisplay(user.status).label}
                  </span>
                </TableCell>
                <TableCell>
                  {user.receivesWithdrawals ? 'Recibe' : 'No recibe'}
                </TableCell>
                <TableCell>
                  <DropdownMenu open={openDropdownId === user.id} onOpenChange={(open) => {
                    setOpenDropdownId(open ? user.id : null)
                  }}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewSessions(user)}>
                        <History className="mr-2 h-4 w-4" />
                        <span>Ver sesiones</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <EditUserModal
            user={selectedUser}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveUser}
          />
          <SessionsModal
            user={selectedUser}
            isOpen={isSessionsModalOpen}
            onClose={() => setIsSessionsModalOpen(false)}
          />
        </>
      )}
    </>
  )
} 