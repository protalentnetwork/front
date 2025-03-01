'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import { Loader2, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  office: z.string().min(1, 'La oficina es requerida'),
  cbu: z.string().min(1, 'El CBU es requerido'),
  alias: z.string().min(1, 'El alias es requerido'),
  wallet: z.enum(['mercadopago', 'paypal']),
  operator: z.string().min(1, 'El operador es requerido'),
  agent: z.string().min(1, 'El agente es requerido'),
  status: z.enum(['active', 'inactive']),
  mp_client_id: z.string().optional(),
  mp_client_secret: z.string().optional(),
})

interface CreateTransferAccountModalProps {
  onAccountCreated: () => Promise<void>
}

export function CreateTransferAccountModal({
  onAccountCreated,
}: CreateTransferAccountModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triggerReset, setTriggerReset] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      office: '',
      cbu: '',
      alias: '',
      wallet: 'mercadopago',
      operator: '',
      agent: '',
      status: 'active',
      mp_client_id: '',
      mp_client_secret: '',
    },
  })

  // Resetear el formulario cuando se cierra el modal o cuando se activa el trigger
  useEffect(() => {
    if (!open || triggerReset) {
      form.reset();
      setTriggerReset(false);
    }
  }, [open, triggerReset, form]);

  const watchWallet = form.watch('wallet')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || response.statusText)
      }

      toast.success('Cuenta de transferencia creada correctamente')
      setTriggerReset(true);
      await onAccountCreated()
      
      // Cerrar el modal después de un pequeño retraso para evitar problemas de interacción
      setTimeout(() => {
        setOpen(false)
      }, 100)
    } catch (error) {
      console.error('Error al crear la cuenta:', error)
      toast.error(`Error al crear la cuenta: ${error instanceof Error ? error.message : 'Intenta nuevamente'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) return; // Prevenir cierre durante el envío
    
    if (!newOpen && open) {
      // Si estamos cerrando el modal, primero actualizamos el estado interno
      // y luego, después de un pequeño retraso, actualizamos el estado real
      setTimeout(() => {
        setOpen(newOpen);
      }, 0);
    } else {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Nueva cuenta</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear cuenta de transferencia</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear una nueva cuenta de transferencia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Oficina</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cbu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CBU</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="wallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de billetera</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agente</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {watchWallet === 'mercadopago' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mp_client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MP Client ID</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mp_client_secret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MP Client Secret</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'active'}
                      onCheckedChange={(checked) => 
                        field.onChange(checked ? 'active' : 'inactive')
                      }
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 