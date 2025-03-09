'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
})

interface PasswordVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (success: boolean) => void
  fieldName: string
  userEmail: string
}

export function PasswordVerificationModal({
  isOpen,
  onClose,
  onVerify,
  fieldName,
  userEmail,
}: PasswordVerificationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Verificar la contraseña usando el endpoint de login existente
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || '/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password: values.password,
        }),
      })

      if (response.ok) {
        onVerify(true)
        onClose()
        form.reset()
      } else {
        toast.error('Contraseña incorrecta')
        onVerify(false)
      }
    } catch (error) {
      console.error('Error al verificar la contraseña:', error)
      toast.error('Error al verificar la contraseña')
      onVerify(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Verificación de contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña para ver el contenido del campo {fieldName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Ocultar" : "Mostrar"} contraseña
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 