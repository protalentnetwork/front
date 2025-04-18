"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus } from "lucide-react"

interface CreateOfficeModalProps {
    onOfficeCreated: () => Promise<void>
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

export function CreateOfficeModal({ onOfficeCreated }: CreateOfficeModalProps) {
    const [open, setOpen] = useState(false)
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
            status: "active",
        },
    })

    const handleSubmit = async (data: OfficeFormData) => {
        if (!data.name) {
            toast.error("El nombre de la oficina es obligatorio")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/offices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success("Oficina creada exitosamente")
                form.reset()
                await onOfficeCreated()
                setTimeout(() => {
                    setOpen(false)
                }, 10)
            } else {
                const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
                toast.error(`Error al crear oficina: ${errorData.message || response.statusText}`)
            }
        } catch (error) {
            console.error("Error creating office:", error)
            toast.error("Error al crear oficina. Intenta nuevamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && isLoading) {
            return;
        }

        if (!newOpen && !isLoading) {
            setTimeout(() => {
                setOpen(newOpen);
            }, 10);
        } else {
            setOpen(newOpen);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Oficina</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px] w-[90vw]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Oficina</DialogTitle>
                    <DialogDescription>
                        Completa los campos para crear una nueva oficina
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
                                            <Input placeholder="Nombre de la oficina" {...field} required />
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
                                            <Input placeholder="+1234567890" {...field} />
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
                                            <Input placeholder="@usuario" {...field} />
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
                                            <Input placeholder="10%" {...field} />
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
                                            <Input placeholder="5%" {...field} />
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
                                            <Input placeholder="$50" {...field} />
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
                                            <Input placeholder="$20" {...field} />
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
                                            <Input placeholder="24h" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creando..." : "Crear"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 