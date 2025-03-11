import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Componente skeleton para un item de chat individual
 * Se utiliza mientras se cargan los datos reales
 */
export function ChatItemSkeleton() {
  return (
    <div className="p-2 sm:p-3 md:p-4 rounded-lg border border-accent">
      <div className="flex flex-col gap-2">
        {/* Primera fila: Información del usuario */}
        <div className="flex justify-between items-start w-full">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-5 w-24 sm:w-32" />
            </div>
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Segunda fila: Badges y botones */}
        <div className="flex justify-between items-center w-full">
          <Skeleton className="h-5 w-24 sm:w-32 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
} 