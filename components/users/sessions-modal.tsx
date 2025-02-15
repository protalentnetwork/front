"use client"

import { User } from "@/types/user"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Session {
  id: string
  ip: string
  startTime: string
  endTime: string | null
}

interface SessionsModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

// Datos de ejemplo
const MOCK_SESSIONS: Session[] = [
  {
    id: "1",
    ip: "192.168.1.100",
    startTime: "2024-03-15T09:30:00",
    endTime: "2024-03-15T17:45:00"
  },
  {
    id: "2",
    ip: "192.168.1.120",
    startTime: "2024-03-14T08:15:00",
    endTime: "2024-03-14T16:30:00"
  },
  {
    id: "3",
    ip: "192.168.1.150",
    startTime: "2024-03-13T10:00:00",
    endTime: null
  }
]

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function SessionsModal({ user, isOpen, onClose }: SessionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Historial de Sesiones</DialogTitle>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Usuario:</span>
              <p className="text-muted-foreground">{user.username}</p>
            </div>
            <div>
              <span className="font-semibold">Rol:</span>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
            <div>
              <span className="font-semibold">Oficina:</span>
              <p className="text-muted-foreground">{user.office}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>Fecha/Hora Apertura</TableHead>
                <TableHead>Fecha/Hora Cierre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SESSIONS.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.ip}</TableCell>
                  <TableCell>{formatDateTime(session.startTime)}</TableCell>
                  <TableCell>
                    {session.endTime 
                      ? formatDateTime(session.endTime)
                      : <span className="text-green-600">Sesión activa</span>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 