// app/dashboard/users/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersClient } from "@/components/users/users-client"
import { RoleGuard } from "@/components/role-guard"

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

export default async function UsersPage() {
  const [internalUsers, externalUsers] = await Promise.all([
    fetchInternalUsers(),
    fetchExternalUsers()
  ])

  return (
    <RoleGuard allowedRoles={['admin']} fallbackUrl="/dashboard/tickets">
      <div className="p-6">
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
      </div>
    </RoleGuard>
  )
}