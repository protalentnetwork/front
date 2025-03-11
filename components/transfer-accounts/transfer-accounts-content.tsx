'use client'

import { useEffect, useState } from 'react'
import { TransferAccount } from '@/types/transfer-account'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TransferAccountsTable } from '@/components/transfer-accounts/transfer-accounts-table'
import { CreateTransferAccountModal } from '@/components/transfer-accounts/create-transfer-account-modal'
import { EditTransferAccountModal } from '@/components/transfer-accounts/edit-transfer-account-modal'
import { DeleteTransferAccountModal } from '@/components/transfer-accounts/delete-transfer-account-modal'
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton, type ColumnConfig } from '@/components/ui/table-skeleton'

interface AccountData {
  name: string
  office: string
  cbu: string
  alias: string
  wallet: 'mercadopago' | 'paypal'
  operator: string
  agent: string
  status: string
  mp_client_id?: string
  mp_client_secret?: string
  mp_public_key?: string
  mp_access_token?: string
}

interface AccountResponse {
  id: number
  name: string
  office: string
  cbu: string
  alias: string
  wallet: 'mercadopago' | 'paypal'
  operator: string
  agent: string
  created_at: string
  status: string
  mp_client_id?: string
  mp_client_secret?: string
  mp_public_key?: string
  mp_access_token?: string
}

export function TransferAccountsContent() {
  const [accounts, setAccounts] = useState<TransferAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingAccount, setEditingAccount] = useState<TransferAccount | null>(null)
  const [deletingAccount, setDeletingAccount] = useState<TransferAccount | null>(null)

  const fetchAccounts = async (showLoadingState = false) => {
    if (showLoadingState) {
      setIsRefreshing(true)
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/accounts`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Error al obtener las cuentas')
      }

      const data = await response.json()
      const transformedAccounts: TransferAccount[] = data.accounts.map((account: AccountResponse) => ({
        id: account.id.toString(),
        userName: account.name,
        office: account.office,
        cbu: account.cbu,
        alias: account.alias,
        wallet: account.wallet,
        operator: account.operator,
        agent: account.agent,
        createdAt: new Date(account.created_at),
        isActive: account.status === 'active',
        mp_client_id: account.mp_client_id,
        mp_client_secret: account.mp_client_secret,
        mp_public_key: account.mp_public_key,
        mp_access_token: account.mp_access_token
      }))

      setAccounts(transformedAccounts)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast.error('No se pudieron cargar las cuentas')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleEdit = async (updatedAccount: TransferAccount) => {
    try {
      const accountData: AccountData = {
        name: updatedAccount.userName,
        office: updatedAccount.office,
        cbu: updatedAccount.cbu,
        alias: updatedAccount.alias,
        wallet: updatedAccount.wallet,
        operator: updatedAccount.operator,
        agent: updatedAccount.agent,
        status: updatedAccount.isActive ? 'active' : 'inactive',
      }

      if (updatedAccount.wallet === 'mercadopago') {
        if (updatedAccount.mp_client_id) accountData.mp_client_id = updatedAccount.mp_client_id
        if (updatedAccount.mp_client_secret) accountData.mp_client_secret = updatedAccount.mp_client_secret
        if (updatedAccount.mp_public_key) accountData.mp_public_key = updatedAccount.mp_public_key
        if (updatedAccount.mp_access_token) accountData.mp_access_token = updatedAccount.mp_access_token
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/accounts/${updatedAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) throw new Error('Error al actualizar la cuenta')

      await fetchAccounts()
      toast.success('Cuenta actualizada correctamente')
      setEditingAccount(null)
    } catch (error) {
      toast.error('Error al actualizar la cuenta')
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deletingAccount) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/accounts/${deletingAccount.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar la cuenta')

      await fetchAccounts()
      toast.success('Cuenta eliminada correctamente')
      setDeletingAccount(null)
    } catch (error) {
      toast.error('Error al eliminar la cuenta')
      throw error
    }
  }

  useEffect(() => {
    // Simular un breve retraso para mostrar el skeleton loader
    const timer = setTimeout(() => {
      fetchAccounts()
    }, 800)
    
    return () => clearTimeout(timer)
  }, [])

  // Skeleton de la tabla de cuentas
  const tableColumns: ColumnConfig[] = [
    { cell: { type: 'text' } }, // Nombre
    { cell: { type: 'text', widthClass: 'w-1/2' } }, // Oficina
    { cell: { type: 'text', widthClass: 'w-4/5' } }, // CBU
    { cell: { type: 'text', widthClass: 'w-4/5' } }, // Alias
    { cell: { type: 'badge', widthClass: 'w-28' } }, // Billetera
    { cell: { type: 'text', widthClass: 'w-3/4' } }, // Operador
    { cell: { type: 'text', widthClass: 'w-2/3' } }, // Agente
    { cell: { type: 'badge', widthClass: 'w-20' } }, // Estado
    { width: 'w-[50px]', cell: { type: 'action', align: 'center' }, header: { show: false } } // Acciones
  ]

  // Contenido del encabezado
  const HeaderContent = (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">Cuentas para transferencias</h1>
      <div className="flex gap-2">
        <Button
          onClick={() => fetchAccounts(true)}
          variant="outline"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            'Actualizar'
          )}
        </Button>
        <CreateTransferAccountModal onAccountCreated={fetchAccounts} />
      </div>
    </div>
  )
  
  // Skeleton del encabezado
  const HeaderSkeleton = (
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
  
  // Contenido de la tabla
  const TableContent = accounts.length === 0 ? (
    <div className="flex flex-col justify-center items-center h-64 border rounded-md">
      <p className="text-lg text-muted-foreground mb-4">No hay cuentas registradas</p>
      <p className="text-sm text-muted-foreground">Crea una nueva cuenta usando el botón &quot;Nueva cuenta&quot;</p>
    </div>
  ) : (
    <TransferAccountsTable
      accounts={accounts}
      onEdit={setEditingAccount}
      onDelete={setDeletingAccount}
    />
  )

  return (
    <div className="container mx-auto py-6">
      {/* Header con título y botones */}
      <SkeletonLoader 
        skeleton={HeaderSkeleton}
        isLoading={isLoading}
      >
        {HeaderContent}
      </SkeletonLoader>
      
      {/* Tabla de cuentas */}
      <SkeletonLoader 
        skeleton={<TableSkeleton columns={tableColumns} rowCount={6} />}
        isLoading={isLoading}
      >
        {TableContent}
      </SkeletonLoader>

      {/* Modales que se mantienen igual */}
      <EditTransferAccountModal
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onConfirm={handleEdit}
      />

      <DeleteTransferAccountModal
        account={deletingAccount}
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
} 