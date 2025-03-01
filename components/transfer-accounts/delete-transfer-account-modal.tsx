'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, AlertTriangle } from 'lucide-react'
import { TransferAccount } from '@/types/transfer-account'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface DeleteTransferAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  account?: TransferAccount | null
}

export function DeleteTransferAccountModal({
  isOpen,
  onClose,
  onConfirm,
  account,
}: DeleteTransferAccountModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isDeleting) {
      setIsDeleting(true)
      try {
        await onConfirm()
        onClose()
      } catch (error) {
        console.error('Error al eliminar la cuenta:', error)
        toast.error('Error al eliminar la cuenta')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isDeleting) {
      if (!open) {
        onClose()
      }
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Eliminar cuenta de transferencia</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {account ? (
                <>
                  <div>
                    Estás a punto de eliminar la cuenta de transferencia:
                  </div>
                  <dl className="bg-muted p-3 rounded-md divide-y divide-border">
                    <div className="grid grid-cols-3 py-2 first:pt-0 last:pb-0">
                      <dt className="font-medium">Nombre</dt>
                      <dd className="col-span-2">{account.userName}</dd>
                    </div>
                    <div className="grid grid-cols-3 py-2">
                      <dt className="font-medium">CBU</dt>
                      <dd className="col-span-2">{account.cbu}</dd>
                    </div>
                    <div className="grid grid-cols-3 py-2">
                      <dt className="font-medium">Alias</dt>
                      <dd className="col-span-2">{account.alias}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                'Estás a punto de eliminar esta cuenta de transferencia.'
              )}
              <div className="text-red-500 font-semibold">
                Esta acción no se puede deshacer. La cuenta será eliminada permanentemente del sistema.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 