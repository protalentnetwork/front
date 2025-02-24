"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function CreateUserModal({ onUserCreated }: { onUserCreated?: () => void }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [office, setOffice] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
            console.log('Creating user at URL:', url, { username, role, office }, 'Time:', new Date().toISOString())
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    role,
                    office,
                    email
                }),
            })

            if (response.ok) {
                setIsOpen(false)
                setUsername("")
                setPassword("")
                setRole("")
                setOffice("")
                setEmail("")
                toast.success("Usuario creado correctamente")
                if (onUserCreated) onUserCreated()
            } else {
                const errorData = await response.json()
                console.error('Error creating user:', errorData)
                throw new Error(errorData.message || "Error al crear el usuario")
            }
        } catch (error: unknown) {
            console.error('Error creating user:', error)
            if (error instanceof Error) {
                toast.error(error.message || "No se pudo crear el usuario")
            } else {
                toast.error("No se pudo crear el usuario")
            }
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Usuario
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese el nombre de usuario"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese la contraseña"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ingrese el email"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="operador">Operador</SelectItem>
                                <SelectItem value="encargado">Encargado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="office">Oficina</Label>
                        <Input
                            id="office"
                            value={office}
                            onChange={(e) => setOffice(e.target.value)}
                            placeholder="Ingrese la oficina"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Crear
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}