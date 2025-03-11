'use client'

import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: string[]
  fallbackUrl?: string
}

/**
 * Component to protect routes based on user roles
 * @param children - The component to render if the user has permission
 * @param allowedRoles - Array of roles that can access this route
 * @param fallbackUrl - URL to redirect to if user doesn't have permission (defaults to dashboard)
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackUrl = '/dashboard'
}: RoleGuardProps) {
  const { user, isLoading, isAdmin, isManager, isOperator } = useAuth()
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-[40vh] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Check if user has an allowed role
  const hasPermission = user?.role && allowedRoles.includes(user.role)
  
  // Redirect if not allowed
  if (!hasPermission) {
    // Redirigir de forma inteligente en función del rol
    let safeRedirectUrl = '/dashboard';
    
    // Asignar una ruta segura según el rol del usuario
    // y evitar cualquier posible ciclo de redirección
    if (user?.role) {
      if (isAdmin) {
        safeRedirectUrl = '/dashboard/users';
      } else if (isManager) {
        safeRedirectUrl = '/dashboard/transfer-accounts';
      } else if (isOperator) {
        safeRedirectUrl = '/dashboard/chat';
      } else {
        // Default para cualquier otro rol
        safeRedirectUrl = '/dashboard/transfer-monitoring';
      }
    }
    
    // Solo usamos el fallbackUrl proporcionado si es diferente a las rutas que sabemos que pueden causar loops
    if (fallbackUrl && 
        fallbackUrl !== '/dashboard' &&
        fallbackUrl !== '/dashboard/tickets' &&
        allowedRoles.length === 1 && 
        (allowedRoles.includes(user?.role || ''))) {
      safeRedirectUrl = fallbackUrl;
    }
    
    redirect(safeRedirectUrl);
  }
  
  // Render children if user has permission
  return <>{children}</>
} 