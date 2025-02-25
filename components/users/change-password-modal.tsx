"use client"

import { useState, useEffect } from "react"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyIcon, EyeIcon, EyeOffIcon } from "lucide-react"

interface ChangePasswordModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (password: string) => Promise<void>
  isLoading: boolean
}

export function ChangePasswordModal({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
    color: string;
  }>({ score: 0, message: "", color: "" })

  // Limpiar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setPassword("")
      setConfirmPassword("")
      setError(null)
      setPasswordStrength({ score: 0, message: "", color: "" })
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [isOpen])

  // Evaluar la fortaleza de la contraseña
  const evaluatePasswordStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength({ score: 0, message: "", color: "" })
      return
    }

    let score = 0
    let message = ""
    let color = ""

    // Longitud mínima
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1

    // Complejidad
    if (/[A-Z]/.test(pwd)) score += 1 // Mayúsculas
    if (/[a-z]/.test(pwd)) score += 1 // Minúsculas
    if (/[0-9]/.test(pwd)) score += 1 // Números
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1 // Caracteres especiales

    // Determinar mensaje y color según puntuación
    if (score < 3) {
      message = "Débil"
      color = "text-red-500"
    } else if (score < 5) {
      message = "Moderada"
      color = "text-yellow-500"
    } else {
      message = "Fuerte"
      color = "text-green-500"
    }

    setPasswordStrength({ score, message, color })
  }

  // Actualizar la evaluación de fortaleza cuando cambia la contraseña
  useEffect(() => {
    evaluatePasswordStrength(password)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (passwordStrength.score < 3) {
      setError("La contraseña es demasiado débil. Incluye mayúsculas, minúsculas, números y caracteres especiales.")
      return
    }
    
    setError(null)
    
    try {
      // Enviar la contraseña al backend
      await onSave(password)
      
      // Limpiar el formulario
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
    }
  }

  // Renderizar barra de fortaleza de contraseña
  const renderStrengthBar = () => {
    if (!password) return null
    
    const bars = []
    const totalBars = 5
    const filledBars = Math.min(passwordStrength.score, totalBars)
    
    // Determinar el color de las barras basado en la puntuación
    let barColor
    if (passwordStrength.score < 3) {
      barColor = 'bg-red-400' // Débil - rojo
    } else if (passwordStrength.score < 5) {
      barColor = 'bg-yellow-400' // Moderada - amarillo
    } else {
      barColor = 'bg-green-400' // Fuerte - verde
    }
    
    for (let i = 0; i < totalBars; i++) {
      // Si la barra debe estar llena, usa el color según la puntuación, si no, usa gris
      const color = i < filledBars ? barColor : 'bg-gray-200'
      
      bars.push(
        <div 
          key={i} 
          className={`h-1.5 rounded-full flex-1 ${color}`}
        />
      )
    }
    
    return (
      <div className="mt-1.5">
        <div className="flex gap-1">
          {bars}
        </div>
        <p className={`text-xs mt-1 ${passwordStrength.color}`}>
          {passwordStrength.message}
        </p>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Cambiar contraseña
          </DialogTitle>
          <DialogDescription>
            Cambiar la contraseña para el usuario <strong>{user.username}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la nueva contraseña"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
              {password && renderStrengthBar()}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme la nueva contraseña"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 mt-1">{error}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, 
              minúsculas, números y caracteres especiales para mayor seguridad.
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !password || !confirmPassword || passwordStrength.score < 3}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 