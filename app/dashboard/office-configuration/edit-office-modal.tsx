"use client"

import { useState, useEffect } from "react"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Office } from "@/components/hooks/use-offices"

interface EditOfficeModalProps {
    office: Office | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOfficeUpdated: () => Promise<void>;
}

interface OfficeFormData {
    name: string;
    whatsapp: string;
    telegram: string;
    firstDepositBonus: string;
    perpetualBonus: string;
    minDeposit: string;
    minWithdrawal: string;
    minWithdrawalWait: string;
    status: string;
}

export function EditOfficeModal({ office, open, onOpenChange, onOfficeUpdated }: EditOfficeModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            name: "",
            whatsapp: "",
            telegram: "",
            firstDepositBonus: "",
            perpetualBonus: "",
            minDeposit: "",
            minWithdrawal: "",
            minWithdrawalWait: "",
            status: "",
        },
    })

    useEffect(() => {
        if (office) {
            form.reset({
                name: office.name || "",
                whatsapp: office.whatsapp || "",
                telegram: office.telegram || "",
                firstDepositBonus: office.firstDepositBonus || "",
                perpetualBonus: office.perpetualBonus || "",
                minDeposit: office.minDeposit || "",
                minWithdrawal: office.minWithdrawal || "",
                minWithdrawalWait: office.minWithdrawalWait || "",
                status: office.status || "active",
            })
        }
    }, [office, form])

    const handleSubmit = async (data: OfficeFormData) => {
        if (!office) return;
        
        if (!data.name) {
            toast.error("El nombre de la oficina es obligatorio")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offices/${office.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success("Oficina actualizada exitosamente")
                await onOfficeUpdated()
                // Solo cerramos el modal después de que todo se ha completado correctamente
                setTimeout(() => {
                    onOpenChange(false)
                }, 10)
            } else {
                const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
                toast.error(`Error al actualizar oficina: ${errorData.message || response.statusText}`)
            }
        } catch (error) {
            console.error("Error updating office:", error)
            toast.error("Error al actualizar oficina. Intenta nuevamente.")
        } finally {
            setIsLoading(false)
        }
    }

    // Manejador específico para el cierre del modal
    const handleOpenChange = (newOpen: boolean) => {
        // Evitar que el modal se cierre durante la carga
        if (!newOpen && isLoading) {
            return;
        }
        
        // Si estamos cerrando el modal, asegurarse de que se limpie correctamente
        if (!newOpen && !isLoading) {
            // Pequeño retraso para asegurar que la animación termine correctamente
            setTimeout(() => {
                onOpenChange(newOpen);
            }, 10);
        } else {
            onOpenChange(newOpen);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[800px] w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Editar Oficina</DialogTitle>
                    <DialogDescription>
                        Actualiza los datos de la oficina
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} required />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="active">Activo</option>
                                                <option value="inactive">Inactivo</option>
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="whatsapp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WhatsApp</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="telegram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telegram</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="firstDepositBonus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bono Primera Carga</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="perpetualBonus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bono Perpetuo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minDeposit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carga Mínima</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minWithdrawal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Retiro Mínimo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minWithdrawalWait"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Tiempo de Espera Mínimo</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 