import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ColumnConfig {
  width?: string          // Ancho de la columna (ej: 'w-40', '200px')
  header?: {
    className?: string    // Clases adicionales para el skeleton del header
    height?: string       // Altura del skeleton (ej: 'h-5')
    widthClass?: string   // Ancho del skeleton relativo (ej: 'w-full', 'w-4/5')
    show?: boolean        // Si mostrar el skeleton en el header (por defecto true)
  }
  cell?: {
    className?: string    // Clases adicionales para el skeleton de celda
    height?: string       // Altura del skeleton (ej: 'h-5')
    widthClass?: string   // Ancho del skeleton relativo (ej: 'w-3/4', 'w-full')
    type?: 'text' | 'badge' | 'action' | 'double' // Tipo de contenido para la celda
    align?: 'left' | 'center' | 'right' // Alineación de la celda
  }
}

export interface TableSkeletonProps {
  /** Configuración de columnas */
  columns: ColumnConfig[] | number
  /** Número de filas en el skeleton */
  rowCount?: number
  /** Borde alrededor de la tabla */
  bordered?: boolean
  /** Clases adicionales para el contenedor */
  className?: string
}

/**
 * Componente genérico de skeleton para tablas.
 * Puede recibir un número para generar columnas simples o un array de configuración detallada.
 */
export function TableSkeleton({ 
  columns, 
  rowCount = 6, 
  bordered = true,
  className 
}: TableSkeletonProps) {
  // Si columns es un número, generar un array de configuración simple
  const columnConfigs: ColumnConfig[] = typeof columns === 'number'
    ? Array(columns).fill({}).map(() => ({
        header: { height: 'h-5', widthClass: 'w-4/5' },
        cell: { height: 'h-5', widthClass: 'w-3/4', type: 'text' }
      }))
    : columns

  return (
    <div className={cn(bordered ? 'rounded-md border' : '', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columnConfigs.map((col, idx) => (
              <TableHead 
                key={idx}
                className={col.width}
              >
                {(col.header?.show !== false) && (
                  <Skeleton 
                    className={cn(
                      col.header?.height || 'h-5',
                      col.header?.widthClass || 'w-4/5',
                      col.header?.className
                    )} 
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rowCount)
            .fill(null)
            .map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {columnConfigs.map((col, colIdx) => {
                  const cellType = col.cell?.type || 'text'
                  const cellAlign = col.cell?.align || 'left'

                  return (
                    <TableCell 
                      key={colIdx}
                      className={cn({
                        'text-right': cellAlign === 'right',
                        'text-center': cellAlign === 'center'
                      })}
                    >
                      {cellType === 'badge' && (
                        <Skeleton className={cn(
                          'rounded-full',
                          col.cell?.height || 'h-6',
                          col.cell?.widthClass || 'w-20',
                          cellAlign === 'center' && 'mx-auto',
                          cellAlign === 'right' && 'ml-auto',
                          col.cell?.className
                        )} />
                      )}
                      
                      {cellType === 'action' && (
                        <Skeleton className={cn(
                          'rounded-full',
                          col.cell?.height || 'h-8',
                          col.cell?.widthClass || 'w-8',
                          cellAlign === 'center' && 'mx-auto',
                          cellAlign === 'right' && 'ml-auto',
                          col.cell?.className
                        )} />
                      )}
                      
                      {cellType === 'text' && (
                        <Skeleton className={cn(
                          col.cell?.height || 'h-5',
                          col.cell?.widthClass || 'w-3/4',
                          cellAlign === 'center' && 'mx-auto',
                          cellAlign === 'right' && 'ml-auto',
                          col.cell?.className
                        )} />
                      )}
                      
                      {cellType === 'double' && (
                        <div className="flex flex-col space-y-1">
                          <Skeleton className={cn(
                            col.cell?.height || 'h-5',
                            col.cell?.widthClass || 'w-3/4',
                            cellAlign === 'center' && 'mx-auto',
                            cellAlign === 'right' && 'ml-auto',
                            col.cell?.className
                          )} />
                          <Skeleton className={cn(
                            'h-4',
                            'w-2/4',
                            cellAlign === 'center' && 'mx-auto',
                            cellAlign === 'right' && 'ml-auto',
                            col.cell?.className
                          )} />
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
} 