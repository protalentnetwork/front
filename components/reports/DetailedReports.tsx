'use client'

import { DataTable } from './DataTable'

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'date', label: 'Fecha' },
  { key: 'type', label: 'Tipo' },
  { key: 'description', label: 'Descripción' },
  { key: 'amount', label: 'Monto' },
  { key: 'status', label: 'Estado' },
]

const mockData = [
  {
    id: '001',
    date: '2024-03-15',
    type: 'Venta',
    description: 'Venta producto A',
    amount: '$1,500',
    status: 'Completado',
  },
  {
    id: '002',
    date: '2024-03-16',
    type: 'Venta',
    description: 'Venta producto B',
    amount: '$1,000',
    status: 'Pendiente',
  },
  {
    id: '003',
    date: '2024-03-17',
    type: 'Venta',
    description: 'Venta producto C',
    amount: '$1,000',
    status: 'Pendiente',
  },
  {
    id: '004',
    date: '2024-03-18',
    type: 'Venta',
    description: 'Venta producto D',
    amount: '$1,000',
    status: 'Pendiente',
  }
]

export function DetailedReports() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reportes Detallados</h2>
      <DataTable columns={columns} data={mockData} />
    </div>
  )
} 