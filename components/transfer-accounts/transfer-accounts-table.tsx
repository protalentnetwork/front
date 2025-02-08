'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TransferAccount } from '@/types/transfer-account'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { EditTransferAccountModal } from '@/components/transfer-accounts/edit-transfer-account-modal'
import { DeleteTransferAccountModal } from '@/components/transfer-accounts/delete-transfer-account-modal'


interface TransferAccountsTableProps {
  accounts: TransferAccount[]
  onEdit: (account: TransferAccount) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TransferAccountsTable({
  accounts,
  onEdit,
  onDelete,
}: TransferAccountsTableProps) {
  const [editingAccount, setEditingAccount] = useState<TransferAccount | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre/Oficina</TableHead>
            <TableHead>CBU/Alias</TableHead>
            <TableHead>Operador</TableHead>
            <TableHead>Agente</TableHead>
            <TableHead>Creación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{account.userName}</span>
                  <span className="text-sm text-muted-foreground">{account.office}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{account.cbu}</span>
                  <span className="text-sm">{account.alias}</span>
                  <span className="text-sm text-muted-foreground">
                    {account.wallet === 'mercadopago' ? 'Mercado Pago' : 'PayPal'}
                  </span>
                </div>
              </TableCell>

              <TableCell>{account.operator}</TableCell>
              <TableCell>{account.agent}</TableCell>
              <TableCell>
                {format(account.createdAt, 'dd/MM/yyyy HH:mm', { locale: es })}
              </TableCell>
              <TableCell>
                <Badge variant={account.isActive ? 'default' : 'secondary'}>
                  {account.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAccount(account)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingAccountId(account.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditTransferAccountModal
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onConfirm={async (updatedAccount) => {
          await onEdit(updatedAccount)
          setEditingAccount(null)
        }}
      />

      <DeleteTransferAccountModal
        isOpen={!!deletingAccountId}
        onClose={() => setDeletingAccountId(null)}
        onConfirm={async () => {
          if (deletingAccountId) {
            await onDelete(deletingAccountId)
            setDeletingAccountId(null)
          }
        }}
      />
    </div>
  )
} 