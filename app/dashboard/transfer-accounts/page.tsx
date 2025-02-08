'use client'

import { useState } from 'react'
import { TransferAccountsTable } from '@/components/transfer-accounts/transfer-accounts-table'
import { TransferAccount } from '@/types/transfer-account'

// TODO: Replace with actual API call
const mockAccounts: TransferAccount[] = [
  {
    id: '1',
    userName: 'Juan Pérez',
    office: 'Sucursal Central',
    cbu: '0000000000000000000000',
    alias: 'juan.perez.mp',
    wallet: 'mercadopago',
    operator: 'María González',
    agent: 'Carlos Rodríguez',
    createdAt: new Date('2024-03-20T10:00:00'),
    isActive: true,
  },
  {
    id: '2',
    userName: 'Ana López',
    office: 'Sucursal Norte',
    cbu: '0000000000000000000001',
    alias: 'ana.lopez.pp',
    wallet: 'paypal',
    operator: 'Ana López',
    agent: 'Carlos Rodríguez',
    createdAt: new Date('2024-03-20T10:00:00'),
    isActive: true,
  },
  {
    id: '3',
    userName: 'Pedro García',
    office: 'Sucursal Sur',
    cbu: '0000000000000000000002',
    alias: 'pedro.garcia.mp',
    wallet: 'mercadopago',
    operator: 'Pedro García',
    agent: 'Carlos Rodríguez',
    createdAt: new Date('2024-03-20T10:00:00'),
    isActive: true,
  },
]


export default function TransferAccountsPage() {
  const [accounts, setAccounts] = useState<TransferAccount[]>(mockAccounts)

  const handleEdit = async (updatedAccount: TransferAccount) => {
    // TODO: Replace with actual API call
    setAccounts(accounts.map(account =>
      account.id === updatedAccount.id ? updatedAccount : account
    ))
  }

  const handleDelete = async (id: string) => {
    // TODO: Replace with actual API call
    setAccounts(accounts.filter(account => account.id !== id))
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Cuentas para transferencias</h1>
      </div>
      <TransferAccountsTable
        accounts={accounts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
