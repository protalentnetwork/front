"use client"

import { useState } from "react"
import { User } from "@/types/user"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: Partial<User>) => void
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    password: "",
    isActive: user.status === "active",
    receivesWithdrawals: user.receivesWithdrawals,
    role: user.role,
    office: user.office,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Campos no editables */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Usuario</Label>
              <Input
                className="col-span-3"
                value={user.username}
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Creación</Label>
              <Input
                className="col-span-3"
                value={new Date(user.createdAt).toLocaleDateString()}
                disabled
              />
            </div>

            {/* Campos editables */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">Contraseña</Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                placeholder="Nueva contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span>{formData.isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Retiros</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.receivesWithdrawals}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, receivesWithdrawals: checked })
                  }
                />
                <span>{formData.receivesWithdrawals ? 'Recibe' : 'No recibe'}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Oficina</Label>
              <Select
                value={formData.office}
                onValueChange={(value) => setFormData({ ...formData, office: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="sucursal a">Sucursal A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 