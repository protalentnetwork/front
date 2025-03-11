'use client'

import React, { ReactNode } from 'react'

interface SkeletonLoaderProps {
  isLoading: boolean
  children: ReactNode
  skeleton: ReactNode
}

/**
 * Componente que muestra un esqueleto durante la carga y el contenido real cuando termina
 * 
 * @param isLoading Flag que indica si está cargando o no
 * @param children Contenido real que se muestra cuando termina la carga
 * @param skeleton Componente de esqueleto que se muestra durante la carga
 */
export function SkeletonLoader({ isLoading, children, skeleton }: SkeletonLoaderProps) {
  return isLoading ? skeleton : children
} 