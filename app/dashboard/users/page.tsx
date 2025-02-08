import { UsersClient } from "@/components/users/users-client"

// Esto es temporal, deberías reemplazarlo con tu lógica de fetching de datos
const MOCK_USERS = [
  {
    id: "1",
    name: "Juan Pérez",
    role: "Administrador",
    office: "Central",
    isActive: true,
    receivesWithdrawals: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "María García",
    role: "Usuario",
    office: "Sucursal A",
    isActive: false,
    receivesWithdrawals: false,
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    name: "Carlos López",
    role: "Usuario",
    office: "Central",
    isActive: true,
    receivesWithdrawals: true,
    createdAt: "2024-03-01",
  }
]

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
      </div>
      
      <UsersClient initialUsers={MOCK_USERS} />
    </div>
  )
}
