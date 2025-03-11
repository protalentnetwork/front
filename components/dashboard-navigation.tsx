'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * Componente que optimiza la navegación en el dashboard asegurando transiciones suaves
 * entre páginas y manteniendo el estado persistente del layout.
 */
export function DashboardNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Gestionar la animación de la barra de progreso
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isNavigating) {
      setProgress(0)
      
      // Simular progreso de carga de manera incremental pero más rápido
      const simulateProgress = () => {
        setProgress(prev => {
          // Incrementar más rápidamente para reducir la sensación de espera
          if (prev < 20) return prev + 15
          if (prev < 50) return prev + 10
          if (prev < 80) return prev + 5
          if (prev < 90) return prev + 2
          return prev + 1 // Avance más rápido en el tramo final
        })
        
        timer = setTimeout(simulateProgress, 40) // Reducir el intervalo entre actualizaciones
      }
      
      timer = setTimeout(simulateProgress, 0)
    } else {
      // Al finalizar, completar rápidamente al 100%
      setProgress(100)
      
      // Luego de mostrar brevemente el 100%, ocultar la barra
      timer = setTimeout(() => {
        setProgress(0)
      }, 300) // Reducir el tiempo que se muestra el 100%
    }
    
    return () => clearTimeout(timer)
  }, [isNavigating])
  
  // Detectar cambios de ruta para mostrar indicador de progreso
  useEffect(() => {
    setIsNavigating(true)
    const timeout = setTimeout(() => {
      setIsNavigating(false)
    }, 300) // Reducir el tiempo a 300ms
    
    return () => clearTimeout(timeout)
  }, [pathname])
  
  // Interceptar navegación mediante clicks en enlaces
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Detectar clicks en enlaces dentro del dashboard
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && 
          link.href.includes('/dashboard') && 
          !link.target && 
          !link.download && 
          !link.rel?.includes('external')
      ) {
        // Verificar si la URL de destino corresponde a la ruta actual
        const hrefPath = new URL(link.href).pathname
        if (hrefPath === pathname) {
          // Evitar navegación y animación si estamos en la misma ruta
          e.preventDefault()
          return
        }
        
        e.preventDefault()
        
        // Iniciar la navegación inmediatamente y luego activar la animación
        // para mejorar la percepción de velocidad
        router.push(link.href)
        setIsNavigating(true)
      }
    }
    
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [router, pathname])
  
  return (
    <div className="relative w-full">
      {/* Barra de progreso con efecto de brillo */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-[3px] bg-primary z-[9999] transition-all overflow-hidden",
          progress === 0 && !isNavigating ? "opacity-0" : "opacity-100"
        )}
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 
            ? "width 0.2s ease-out, opacity 0.5s ease-out 0.3s" 
            : "width 0.3s cubic-bezier(0.65, 0, 0.35, 1)"
        }}
      >
        {/* Efecto de brillo que se mueve a lo largo de la barra */}
        <div 
          className="absolute inset-0 w-24 h-full animate-shimmer" 
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          }}
        />
      </div>
      
      <div key={pathname} className="transition-all duration-300">
        {children}
      </div>
    </div>
  )
} 