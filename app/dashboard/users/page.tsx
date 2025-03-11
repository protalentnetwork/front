// app/dashboard/users/page.tsx
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersClient } from "@/components/users/users-client"
import { RoleGuard } from "@/components/role-guard"
import { TableSkeleton, type ColumnConfig } from '@/components/ui/table-skeleton'
import { Skeleton } from "@/components/ui/skeleton"

const fetchInternalUsers = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
  const response = await fetch(url, {
    cache: 'no-store', // Evitar caché
  })
  if (!response.ok) {
    return []
  }
  const data = await response.json()
  return data
}

const fetchExternalUsers = async () => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/external-users` // Endpoint diferente
  const response = await fetch(url, {
    cache: 'no-store', // Evitar caché
  })
  if (!response.ok) {
    return []
  }
  const data = await response.json()
  return data
}

// Componente de carga para las pestañas
function TabsLoadingSkeleton() {
  // Configuración de columnas para la tabla de usuarios
  const tableColumns: ColumnConfig[] = [
    { cell: { type: 'double', widthClass: 'w-3/4' } }, // Nombre/Email
    { cell: { type: 'text', widthClass: 'w-16' } },    // Rol
    { cell: { type: 'text', widthClass: 'w-20' } },    // Oficina
    { cell: { type: 'badge', widthClass: 'w-14' } },   // Estado
    { width: 'w-[50px]', cell: { type: 'action', align: 'right' }, header: { show: false } } // Acciones
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-40" />
        <div className="border rounded-lg p-1">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <TableSkeleton columns={tableColumns} rowCount={8} />
      </div>
    </div>
  )
}

// Componente contenedor para los datos de usuario
function UsersData({ 
  internalUsers, 
  externalUsers 
}: { 
  internalUsers: any[], 
  externalUsers: any[] 
}) {
  return (
    <Tabs defaultValue="internal" className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <TabsList>
          <TabsTrigger value="internal">Usuarios Internos</TabsTrigger>
          <TabsTrigger value="external">Usuarios Externos</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="internal">
        <UsersClient initialUsers={internalUsers} userType="internal" />
      </TabsContent>

      <TabsContent value="external">
        <UsersClient initialUsers={externalUsers} userType="external" />
      </TabsContent>
    </Tabs>
  )
}

export default async function UsersPage() {
  // Cargamos los datos en el servidor
  const [internalUsers, externalUsers] = await Promise.all([
    fetchInternalUsers(),
    fetchExternalUsers()
  ])

  return (
    <RoleGuard allowedRoles={['admin', 'encargado', 'operador']}>
      <div className="p-6">
        <Suspense fallback={<TabsLoadingSkeleton />}>
          <UsersData 
            internalUsers={internalUsers} 
            externalUsers={externalUsers} 
          />
        </Suspense>
      </div>
    </RoleGuard>
  )
}